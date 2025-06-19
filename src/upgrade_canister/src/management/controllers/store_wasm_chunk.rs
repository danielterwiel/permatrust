use shared::types::{
    errors::AppError,
    management::{StoreWasmChunkInput, StoreWasmChunkResult},
};

use crate::management::management_manager::ManagementManager;

#[ic_cdk_macros::update]
fn store_wasm_chunk(input: StoreWasmChunkInput) -> StoreWasmChunkResult {
    match ManagementManager::store_wasm_chunk(input.version, input.chunk) {
        Ok(_) => StoreWasmChunkResult::Ok(()),
        Err(e) => StoreWasmChunkResult::Err(AppError::StoreWasmModuleFailed(e)),
    }
}
