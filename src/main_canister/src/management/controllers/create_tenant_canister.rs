use crate::management::management_manager::ManagementManager;
use crate::management::types::CreateTenantCanisterResult;
use ic_cdk_macros::update;
use shared::types::management::CreateTenantCanisterInput;

#[update]
pub async fn create_tenant_canister(
    input: CreateTenantCanisterInput,
) -> CreateTenantCanisterResult {
    ManagementManager::create_tenant_canister(input).await
}
