use crate::workflows::workflows_manager::WorkflowsManager;
use shared::log_info;
use shared::types::workflows::{CreateWorkflowInput, CreateWorkflowResult};
use shared::utils::logs::loggable_workflow;

#[ic_cdk_macros::update]
pub fn create_workflow(workflow: CreateWorkflowInput) -> CreateWorkflowResult {
    match WorkflowsManager::create_workflow(workflow) {
        Ok(id) => {
            if let Some(created_workflow) = WorkflowsManager::get_workflow_by_id(&id) {
                log_info!(
                    "workflow_creation: Created {}",
                    loggable_workflow(&created_workflow)
                );
            }
            CreateWorkflowResult::Ok(id)
        }
        Err(e) => CreateWorkflowResult::Err(e),
    }
}
