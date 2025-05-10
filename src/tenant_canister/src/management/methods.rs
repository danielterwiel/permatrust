use candid::Principal;

use ic_cdk::management_canister::{install_code, CanisterInstallMode, InstallCodeArgs};
use shared::types::{
    errors::AppError,
    management::{UpgradeCanisterInput, UpgradeCanisterResult},
};

// TODO: env
const AUTHORIZED_UPGRADER_PRINCIPAL_STR: &str = "your-main-canister-principal-id";

#[ic_cdk_macros::update]
async fn upgrade_canister(input: UpgradeCanisterInput) -> UpgradeCanisterResult {
    let caller = ic_cdk::api::msg_caller();
    let authorized_upgrader = Principal::from_text(AUTHORIZED_UPGRADER_PRINCIPAL_STR)
        .expect("Failed to parse authorized upgrader principal");

    if caller != authorized_upgrader {
        return UpgradeCanisterResult::Err(AppError::UpdateFailed(
            "Unauthorized: Caller is not the designated upgrader canister.".to_string(),
        ));
    }
    let install_arg = InstallCodeArgs {
        mode: CanisterInstallMode::Reinstall,
        canister_id: ic_cdk::api::canister_self(),
        wasm_module: input.wasm_module,
        arg: vec![],
    };

    match install_code(&install_arg).await {
        Ok(()) => UpgradeCanisterResult::Ok(()),
        Err(error) => UpgradeCanisterResult::Err(AppError::UpdateFailed(format!(
            "Failed to self-upgrade. Rejection code: {:?}",
            error
        ))),
    }
}
