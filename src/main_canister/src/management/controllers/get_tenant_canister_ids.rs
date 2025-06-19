use crate::management::management_manager::ManagementManager;
use crate::management::types::GetTenantCanisterIdsResult;
use ic_cdk_macros::query;

#[query]
pub fn get_tenant_canister_ids() -> GetTenantCanisterIdsResult {
    ManagementManager::get_tenant_canister_ids()
}
