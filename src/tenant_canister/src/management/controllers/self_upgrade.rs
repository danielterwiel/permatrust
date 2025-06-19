use crate::management::management_manager::ManagementManager;
use ic_cdk_macros::update;
use shared::types::management::UpgradeCanisterResult;

#[update]
async fn self_upgrade() -> UpgradeCanisterResult {
    ManagementManager::self_upgrade().await
}
