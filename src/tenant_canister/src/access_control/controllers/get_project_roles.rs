use crate::access_control::access_control_manager::AccessControlManager;
use shared::types::access_control::{GetProjectRolesInput, GetProjectRolesResult};

#[ic_cdk_macros::query]
pub fn get_project_roles(input: GetProjectRolesInput) -> GetProjectRolesResult {
    AccessControlManager::get_project_roles(input)
}
