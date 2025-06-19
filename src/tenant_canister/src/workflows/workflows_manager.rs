use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use serde::{Deserialize, Serialize};
use shared::consts::memory_ids::tenant_canister::WORKFLOWS_MEMORY_ID;
use shared::traits::workflows::WorkflowGraphExt;
use shared::types::errors::AppError;
use shared::types::workflows::{
    CreateWorkflowInput, Edge, EventId, StateId, Workflow, WorkflowGraph, WorkflowId,
};
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static WORKFLOWS: RefCell<StableBTreeMap<WorkflowId, Workflow, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(WORKFLOWS_MEMORY_ID))),
        )
    );

    static NEXT_ID: AtomicU32 = const { AtomicU32::new(0) };
}

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

pub struct WorkflowsManager {}

impl WorkflowsManager {
    fn next_workflow_id() -> WorkflowId {
        NEXT_ID.with(|counter| counter.fetch_add(1, Ordering::SeqCst))
    }

    pub fn create_workflow(workflow_input: CreateWorkflowInput) -> Result<WorkflowId, AppError> {
        let graph = match WorkflowGraph::from_json(&workflow_input.graph_json) {
            Ok(g) => g,
            Err(e) => return Err(AppError::InvalidInput(e)),
        };

        let state_machine =
            GenericStateMachine::from_workflow_graph(&graph, workflow_input.initial_state.clone());
        let id = Self::next_workflow_id();

        let workflow = Workflow {
            id,
            name: workflow_input.name,
            project_id: workflow_input.project_id,
            graph,
            current_state: state_machine.current_state().clone(),
        };

        WORKFLOWS.with(|workflows| {
            workflows.borrow_mut().insert(id, workflow);
        });

        Ok(id)
    }

    pub fn get_all_workflows() -> Vec<Workflow> {
        WORKFLOWS.with(|workflows| {
            workflows
                .borrow()
                .iter()
                .map(|(_, workflow)| workflow.clone())
                .collect()
        })
    }

    pub fn get_workflow_by_id(id: &WorkflowId) -> Option<Workflow> {
        WORKFLOWS.with(|workflows| workflows.borrow().get(id))
    }

    pub fn execute_workflow(workflow_id: WorkflowId, event_id: EventId) -> Result<(), AppError> {
        let workflow = match Self::get_workflow_by_id(&workflow_id) {
            Some(w) => w,
            None => return Err(AppError::EntityNotFound("Workflow not found".to_string())),
        };

        let mut state_machine = GenericStateMachine::from_workflow_graph(
            &workflow.graph,
            workflow.current_state.clone(),
        );

        match state_machine.transition(&event_id) {
            Ok(_) => {
                let mut updated_workflow = workflow.clone();
                updated_workflow.current_state = state_machine.current_state().clone();
                Self::update_workflow(workflow_id, updated_workflow);
                Ok(())
            }
            Err(e) => Err(AppError::InvalidStateTransition(e)),
        }
    }

    pub fn get_workflow_state(workflow_id: WorkflowId) -> Option<StateId> {
        Self::get_workflow_by_id(&workflow_id).map(|w| w.current_state.clone())
    }

    pub fn get_workflow_definition(workflow_id: WorkflowId) -> Option<WorkflowGraph> {
        Self::get_workflow_by_id(&workflow_id).map(|w| w.graph.clone())
    }

    fn update_workflow(id: WorkflowId, workflow: Workflow) {
        WORKFLOWS.with(|workflows| {
            workflows.borrow_mut().insert(id, workflow);
        });
    }
}
