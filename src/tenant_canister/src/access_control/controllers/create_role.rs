use crate::access_control::access_control_manager::AccessControlManager;
use shared::types::access_control::{CreateRoleInput, CreateRoleResult};

#[ic_cdk_macros::update]
pub fn create_role(input: CreateRoleInput) -> CreateRoleResult {
    AccessControlManager::create_role(input)
}
