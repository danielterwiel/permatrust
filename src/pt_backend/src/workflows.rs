use ic_cdk_macros::{query, update};
use petgraph::visit::EdgeRef;
use shared::pagination::paginate;
use shared::pt_backend_generated::{
    AppError, EventId, PaginatedWorkflowsResult, PaginationInput, ProjectId, StateId, Workflow,
    WorkflowGraph, WorkflowGraphExt, WorkflowId, WorkflowIdResult, WorkflowResult,
};
use std::cell::RefCell;
use std::collections::HashMap;

use crate::logger::{log_info, loggable_workflow};

thread_local! {
    static WORKFLOWS: RefCell<HashMap<WorkflowId, Workflow>> = RefCell::new(HashMap::new());
}

pub fn get_next_workflow_id() -> u64 {
    WORKFLOWS.with(|workflows| workflows.borrow().len() as u64)
}

#[update]
fn create_workflow(
    name: String,
    project_id: ProjectId,
    graph_json: String,
    initial_state: StateId,
) -> WorkflowIdResult {
    let graph = match <WorkflowGraph as WorkflowGraphExt>::from_json(&graph_json) {
        Ok(graph) => graph,
        Err(e) => return WorkflowIdResult::Err(AppError::InvalidInput(e)),
    };
    let id = get_next_workflow_id();
    let workflow = Workflow {
        id,
        name,
        project_id,
        current_state: initial_state,
        graph,
    };
    WORKFLOWS.with(|workflows| {
        workflows.borrow_mut().insert(id, workflow.clone());
    });

    log_info("create_workflow", loggable_workflow(&workflow));

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
        let graph = workflow.graph.to_graph();

        // Find the current state index
        let current_state_idx = graph
            .node_indices()
            .find(|&idx| graph[idx] == workflow.current_state)
            .ok_or("Current state not found in the graph")?;

        // Find an edge with the given event from the current state
        let mut found = false;
        for edge in graph.edges(current_state_idx) {
            if edge.weight() == &event {
                let target_idx = edge.target();
                let target_state = &graph[target_idx];
                workflow.current_state = target_state.clone();
                found = true;
                break;
            }
        }

        if found {
            Ok(())
        } else {
            Err("Invalid event for the current state".to_string())
        }
    })
}

/// Retrieve the current state of a workflow
#[query]
fn get_workflow_state(id: WorkflowId) -> Result<StateId, String> {
    WORKFLOWS.with(|workflows| {
        let workflows = workflows.borrow();
        let workflow = workflows.get(&id).ok_or("Workflow not found")?;
        Ok(workflow.current_state.clone())
    })
}

/// Retrieve the workflow definition
#[query]
fn get_workflow_definition(id: WorkflowId) -> Result<WorkflowGraph, String> {
    WORKFLOWS.with(|workflows| {
        let workflows = workflows.borrow();
        let workflow = workflows.get(&id).ok_or("Workflow not found")?;
        Ok(workflow.graph.clone())
    })
}
