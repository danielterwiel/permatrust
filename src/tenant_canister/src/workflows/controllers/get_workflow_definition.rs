use crate::workflows::workflows_manager::WorkflowsManager;
use shared::types::errors::AppError;
use shared::types::workflows::{GetWorkflowDefinitionResult, WorkflowIdInput};

#[ic_cdk_macros::query]
pub fn get_workflow_definition(input: WorkflowIdInput) -> GetWorkflowDefinitionResult {
    match WorkflowsManager::get_workflow_definition(input.id) {
        Some(definition) => GetWorkflowDefinitionResult::Ok(definition),
        None => GetWorkflowDefinitionResult::Err(AppError::EntityNotFound(
            "Workflow not found".to_string(),
        )),
    }
}
