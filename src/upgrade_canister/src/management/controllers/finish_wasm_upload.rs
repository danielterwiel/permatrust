use shared::types::{errors::AppError, management::FinishWasmUploadResult};

use crate::management::management_manager::ManagementManager;

#[ic_cdk_macros::update]
fn finish_wasm_upload(version: u32) -> FinishWasmUploadResult {
    match ManagementManager::finish_wasm_upload(version) {
        Ok(_) => FinishWasmUploadResult::Ok(()),
        Err(e) => FinishWasmUploadResult::Err(AppError::StoreWasmModuleFailed(e)),
    }
}
