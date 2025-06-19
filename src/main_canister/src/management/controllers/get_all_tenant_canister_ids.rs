use crate::management::management_manager::ManagementManager;
use crate::management::types::GetAllTenantCanistersResult;
use ic_cdk_macros::query;

// NOTE: admin only
#[query]
pub fn get_all_tenant_canister_ids() -> GetAllTenantCanistersResult {
    ManagementManager::get_all_tenant_canister_ids_result()
}
