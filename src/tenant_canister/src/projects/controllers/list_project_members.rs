use crate::projects::projects_manager::ProjectsManager;
use shared::types::projects::{ListProjectMembersInput, ListProjectMembersResult};

#[ic_cdk_macros::query]
pub fn list_project_members(input: ListProjectMembersInput) -> ListProjectMembersResult {
    ProjectsManager::list_project_members(input)
}
