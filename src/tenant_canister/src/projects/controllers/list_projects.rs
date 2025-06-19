use crate::projects::projects_manager::ProjectsManager;
use shared::types::pagination::PaginationInput;
use shared::types::projects::ListProjectsResult;

#[ic_cdk_macros::query]
pub fn list_projects(pagination: PaginationInput) -> ListProjectsResult {
    ProjectsManager::list_projects(pagination)
}
