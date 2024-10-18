use ic_cdk_macros::{query, update};
use serde::{Deserialize, Serialize};
use shared::pagination::paginate;
use shared::pt_backend_generated::{
    AppError, CreateWorkflowInput, Edge, EventId, PaginatedWorkflowsResult, PaginationInput,
    StateId, Workflow, WorkflowGraph, WorkflowId, WorkflowIdResult, WorkflowResult,
};
use shared::pt_backend_generated_traits::WorkflowGraphExt;
use std::cell::RefCell;
use std::collections::HashMap;

use crate::logger::{log_info, loggable_workflow};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Hash)]
pub struct GenericState(pub StateId);

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq, Hash)]
pub struct GenericEvent(pub EventId);

#[derive(Clone, Debug)]
pub struct GenericStateMachine {
    transitions: HashMap<(StateId, EventId), StateId>,
    current_state: StateId,
}

impl GenericStateMachine {
    pub fn new(initial_state: StateId) -> Self {
        GenericStateMachine {
            transitions: HashMap::new(),
            current_state: initial_state,
        }
    }

    pub fn add_transition(&mut self, from: StateId, event: EventId, to: StateId) {
        self.transitions.insert((from, event), to);
    }

    pub fn transition(&mut self, event: &EventId) -> Result<(), String> {
        if let Some(new_state) = self
            .transitions
            .get(&(self.current_state.clone(), event.clone()))
        {
            self.current_state = new_state.clone();
            Ok(())
        } else {
            Err(format!(
                "Invalid transition: {} from state {}",
                event, self.current_state
            ))
        }
    }

    pub fn current_state(&self) -> &StateId {
        &self.current_state
    }

    pub fn from_workflow_graph(graph: &WorkflowGraph, initial_state: StateId) -> Self {
        let mut state_machine = GenericStateMachine::new(initial_state);

        for Edge(source_idx, target_idx, event) in &graph.edges {
            let from = &graph.nodes[*source_idx as usize];
            let to = &graph.nodes[*target_idx as usize];
            state_machine.add_transition(from.clone(), event.clone(), to.clone());
        }

        state_machine
    }
}

thread_local! {
    static WORKFLOWS: RefCell<HashMap<WorkflowId, Workflow>> = RefCell::new(HashMap::new());
    static WORKFLOW_COUNTER: RefCell<u64> = RefCell::new(0);
}

pub fn get_next_workflow_id() -> u64 {
    WORKFLOW_COUNTER.with(|counter| {
        let mut id = counter.borrow_mut();
        let next_id = *id;
        *id += 1;
        next_id
    })
}

#[update]
fn create_workflow(workflow: CreateWorkflowInput) -> WorkflowIdResult {
    let graph = match WorkflowGraph::from_json(&workflow.graph_json) {
        Ok(g) => g,
        Err(e) => return WorkflowIdResult::Err(AppError::InvalidInput(e)),
    };
    let state_machine =
        GenericStateMachine::from_workflow_graph(&graph, workflow.initial_state.clone());
    let id = get_next_workflow_id();
    let workflow = Workflow {
        id,
        name: workflow.name,
        project_id: workflow.project_id,
        graph,
        current_state: state_machine.current_state().clone(),
    };

    log_info("create_workflow", loggable_workflow(&workflow));

    WORKFLOWS.with(|workflows| {
        workflows.borrow_mut().insert(id, workflow.clone());
    });

    WorkflowIdResult::Ok(id)
}

#[query]
fn list_workflows(pagination: PaginationInput) -> PaginatedWorkflowsResult {
    let workflows =
        WORKFLOWS.with(|workflows| workflows.borrow().values().cloned().collect::<Vec<_>>());

    match paginate(&workflows, pagination.page_size, pagination.page_number) {
        Ok((paginated_workflows, pagination_metadata)) => {
            PaginatedWorkflowsResult::Ok(paginated_workflows, pagination_metadata)
        }
        Err(e) => PaginatedWorkflowsResult::Err(e),
    }
}

#[query]
fn get_workflow(workflow_id: u64) -> WorkflowResult {
    WORKFLOWS.with(|workflows| match workflows.borrow().get(&workflow_id) {
        Some(workflow) => WorkflowResult::Ok(workflow.clone()),
        None => WorkflowResult::Err(AppError::EntityNotFound("Workflow not found".to_string())),
    })
}

#[update]
fn execute_workflow(id: WorkflowId, event: EventId) -> Result<(), String> {
    WORKFLOWS.with(|workflows| {
        let mut workflows = workflows.borrow_mut();
        let workflow = workflows.get_mut(&id).ok_or("Workflow not found")?;

        let mut state_machine = GenericStateMachine::from_workflow_graph(
            &workflow.graph,
            workflow.current_state.clone(),
        );
        state_machine.transition(&event)?;
        workflow.current_state = state_machine.current_state().clone();
        Ok(())
    })
}

#[query]
fn get_workflow_state(id: WorkflowId) -> Result<StateId, String> {
    WORKFLOWS.with(|workflows| {
        let workflows = workflows.borrow();
        let workflow = workflows.get(&id).ok_or("Workflow not found")?;
        Ok(workflow.current_state.clone())
    })
}

#[query]
fn get_workflow_definition(id: WorkflowId) -> Result<WorkflowGraph, String> {
    WORKFLOWS.with(|workflows| {
        let workflows = workflows.borrow();
        let workflow = workflows.get(&id).ok_or("Workflow not found")?;
        Ok(workflow.graph.clone())
    })
}
