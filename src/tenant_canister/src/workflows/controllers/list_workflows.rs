use crate::workflows::workflows_manager::WorkflowsManager;
use shared::types::pagination::PaginationInput;
use shared::types::workflows::ListWorkflowsResult;
use shared::utils::pagination::paginate;

#[ic_cdk_macros::query]
pub fn list_workflows(pagination: PaginationInput) -> ListWorkflowsResult {
    let workflows = WorkflowsManager::get_all_workflows();
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
