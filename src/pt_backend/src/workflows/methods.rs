use super::state::{self, GenericStateMachine};
use super::*;
use crate::logger::{log_info, loggable_workflow};
use shared::utils::pagination::paginate;

#[ic_cdk_macros::update]
pub fn create_workflow(workflow: CreateWorkflowInput) -> Result<WorkflowId, AppError> {
    let graph = match WorkflowGraph::from_json(&workflow.graph_json) {
        Ok(g) => g,
        Err(e) => return Err(AppError::InvalidInput(e)),
    };
    let state_machine =
        GenericStateMachine::from_workflow_graph(&graph, workflow.initial_state.clone());
    let id = state::get_next_id();
    let workflow = Workflow {
        id,
        name: workflow.name,
        project_id: workflow.project_id,
        graph,
        current_state: state_machine.current_state().clone(),
    };

    log_info("create_workflow", loggable_workflow(&workflow));
    state::insert(id, workflow.clone());

    Ok(id)
}

#[ic_cdk_macros::query]
pub fn list_workflows(pagination: PaginationInput) -> PaginatedWorkflowsResult {
    let workflows = state::get_all();
    paginate(
        &workflows,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[ic_cdk_macros::query]
pub fn get_workflow(workflow_id: WorkflowId) -> Result<Workflow, AppError> {
    match state::get_by_id(&workflow_id) {
        Some(workflow) => WorkflowResult::Ok(workflow.clone()),
        None => WorkflowResult::Err(AppError::EntityNotFound("Workflow not found".to_string())),
    }
}

#[ic_cdk_macros::update]
pub fn execute_workflow(id: WorkflowId, event: EventId) -> Result<(), String> {
    let workflow = state::get_by_id(&id).ok_or("Workflow not found")?;
    let mut state_machine =
        GenericStateMachine::from_workflow_graph(&workflow.graph, workflow.current_state.clone());

    state_machine.transition(&event)?;

    let mut updated_workflow = workflow.clone();
    updated_workflow.current_state = state_machine.current_state().clone();
    state::update(id, updated_workflow);

    Ok(())
}

#[ic_cdk_macros::query]
pub fn get_workflow_state(id: WorkflowId) -> Result<StateId, String> {
    let workflow = state::get_by_id(&id).ok_or("Workflow not found")?;
    Ok(workflow.current_state.clone())
}

#[ic_cdk_macros::query]
pub fn get_workflow_definition(id: WorkflowId) -> Result<WorkflowGraph, String> {
    let workflow = state::get_by_id(&id).ok_or("Workflow not found")?;
    Ok(workflow.graph.clone())
}
