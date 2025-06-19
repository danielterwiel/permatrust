use shared::types::{
    errors::AppError,
    management::{StoreWasmModuleResult, StoreWasmUpgradeCanisterInput},
};

use crate::management::management_manager::ManagementManager;

#[ic_cdk_macros::update]
fn store_wasm_module(input: StoreWasmUpgradeCanisterInput) -> StoreWasmModuleResult {
    match ManagementManager::store_wasm_module(input.version, input.wasm_bytes) {
        Ok(_) => StoreWasmModuleResult::Ok(()),
        Err(e) => StoreWasmModuleResult::Err(AppError::StoreWasmModuleFailed(e)),
    }
}
