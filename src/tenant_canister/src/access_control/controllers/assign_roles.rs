use crate::access_control::access_control_manager::AccessControlManager;
use shared::types::access_control::{AssignRolesInput, AssignRolesResult};

#[ic_cdk_macros::update]
pub fn assign_roles(input: AssignRolesInput) -> AssignRolesResult {
    AccessControlManager::assign_roles(input)
}
