use crate::workflows::workflows_manager::WorkflowsManager;
use shared::types::errors::AppError;
use shared::types::workflows::{GetWorkflowStateResult, WorkflowIdInput};

#[ic_cdk_macros::query]
pub fn get_workflow_state(input: WorkflowIdInput) -> GetWorkflowStateResult {
    match WorkflowsManager::get_workflow_state(input.id) {
        Some(state) => GetWorkflowStateResult::Ok(state),
        None => {
            GetWorkflowStateResult::Err(AppError::EntityNotFound("Workflow not found".to_string()))
        }
    }
}
