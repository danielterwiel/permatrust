use crate::access_control::access_control_manager::AccessControlManager;
use shared::types::access_control::GetPermissionsResult;

#[ic_cdk_macros::query]
pub fn get_permissions() -> GetPermissionsResult {
    AccessControlManager::get_permissions()
}
