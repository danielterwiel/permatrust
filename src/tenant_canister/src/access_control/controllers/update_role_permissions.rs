use crate::access_control::access_control_manager::AccessControlManager;
use shared::types::access_control::{UpdateRolePermissionsInput, UpdateRolePermissionsResult};

#[ic_cdk_macros::update]
pub fn update_role_permissions(input: UpdateRolePermissionsInput) -> UpdateRolePermissionsResult {
    AccessControlManager::update_role_permissions(input)
}
