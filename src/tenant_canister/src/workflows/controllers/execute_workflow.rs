use crate::workflows::workflows_manager::WorkflowsManager;
use shared::types::workflows::{ExecuteWorkflowInput, ExecuteWorkflowResult};

#[ic_cdk_macros::update]
pub fn execute_workflow(input: ExecuteWorkflowInput) -> ExecuteWorkflowResult {
    match WorkflowsManager::execute_workflow(input.workflow_id, input.event_id) {
        Ok(_) => ExecuteWorkflowResult::Ok(()),
        Err(e) => ExecuteWorkflowResult::Err(e),
    }
}
