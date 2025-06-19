use crate::projects::projects_manager::ProjectsManager;
use shared::types::projects::{CreateProjectInput, CreateProjectResult};

#[ic_cdk_macros::update]
pub fn create_project(input: CreateProjectInput) -> CreateProjectResult {
    ProjectsManager::create_project(input)
}
