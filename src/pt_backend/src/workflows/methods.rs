use super::state::{self, GenericStateMachine};
use super::*;
use crate::logger::{log_info, loggable_workflow};
use shared::types::workflows::{
    CreateWorkflowResult, ExecuteWorkflowInput, ExecuteWorkflowResult, GetWorkflowDefinitionResult,
    GetWorkflowStateResult, ListWorkflowsResult, WorkflowIdInput,
};
use shared::utils::pagination::paginate;

#[ic_cdk_macros::update]
pub fn create_workflow(workflow: CreateWorkflowInput) -> CreateWorkflowResult {
    let graph = match WorkflowGraph::from_json(&workflow.graph_json) {
        Ok(g) => g,
        Err(e) => return CreateWorkflowResult::Err(AppError::InvalidInput(e)),
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

    CreateWorkflowResult::Ok(id)
}

#[ic_cdk_macros::query]
pub fn list_workflows(pagination: PaginationInput) -> ListWorkflowsResult {
    let workflows = state::get_all();
    paginate(
        &workflows,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
    .map(|(data, meta)| ListWorkflowsResult::Ok((data, meta)))
    .unwrap_or_else(ListWorkflowsResult::Err)
}

#[ic_cdk_macros::update]
pub fn execute_workflow(input: ExecuteWorkflowInput) -> ExecuteWorkflowResult {
    let workflow = match state::get_by_id(&input.workflow_id) {
        Some(w) => w,
        None => {
            return ExecuteWorkflowResult::Err(AppError::EntityNotFound(
                "Workflow not found".to_string(),
            ))
        }
    };

    let mut state_machine =
        GenericStateMachine::from_workflow_graph(&workflow.graph, workflow.current_state.clone());

    match state_machine.transition(&input.event_id) {
        Ok(_) => {
            let mut updated_workflow = workflow.clone();
            updated_workflow.current_state = state_machine.current_state().clone();
            state::update(input.workflow_id, updated_workflow);
            ExecuteWorkflowResult::Ok(())
        }
        Err(e) => ExecuteWorkflowResult::Err(AppError::InvalidStateTransition(e)),
    }
}

#[ic_cdk_macros::query]
pub fn get_workflow_state(input: WorkflowIdInput) -> GetWorkflowStateResult {
    state::get_by_id(&input.id)
        .map(|w| GetWorkflowStateResult::Ok(w.current_state.clone()))
        .unwrap_or_else(|| {
            GetWorkflowStateResult::Err(AppError::EntityNotFound("Workflow not found".to_string()))
        })
}

#[ic_cdk_macros::query]
pub fn get_workflow_definition(input: WorkflowIdInput) -> GetWorkflowDefinitionResult {
    state::get_by_id(&input.id)
        .map(|w| GetWorkflowDefinitionResult::Ok(w.graph.clone()))
        .unwrap_or_else(|| {
            GetWorkflowDefinitionResult::Err(AppError::EntityNotFound(
                "Workflow not found".to_string(),
            ))
        })
}
