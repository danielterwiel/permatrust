use shared::types::{
    errors::AppError,
    management::{
        FinishWasmUploadResult, GetAllWasmVersionsResult, GetWasmByVersionResult,
        GetWasmChunkInput, GetWasmChunkResult, StoreWasmChunkInput, StoreWasmChunkResult,
        StoreWasmModuleResult, StoreWasmUpgradeCanisterInput,
    },
};
use shared::{log_debug, log_info};

use crate::management::state;

#[ic_cdk_macros::update]
fn store_wasm_module(input: StoreWasmUpgradeCanisterInput) -> StoreWasmModuleResult {
    match state::store_wasm_module(input.version, input.wasm_bytes) {
        Ok(_) => StoreWasmModuleResult::Ok(()),
        Err(e) => StoreWasmModuleResult::Err(AppError::StoreWasmModuleFailed(e)),
    }
}

#[ic_cdk_macros::query]
fn get_wasm_by_version(version: u32) -> GetWasmByVersionResult {
    match state::get_wasm_by_version(version) {
        Some(wasm_bytes) => {
            log_debug!(
                "Found WASM version {}, length: {}, first 8 bytes: {:?}",
                version,
                wasm_bytes.len(),
                if wasm_bytes.len() >= 8 {
                    &wasm_bytes[0..8]
                } else {
                    &wasm_bytes[..]
                }
            );
            GetWasmByVersionResult::Ok(Some(wasm_bytes))
        }
        None => {
            log_info!("WASM version {} not found", version);
            GetWasmByVersionResult::Ok(None)
        }
    }
}

#[ic_cdk_macros::query]
fn get_all_wasm_versions() -> GetAllWasmVersionsResult {
    let versions = state::get_all_wasm_versions();
    GetAllWasmVersionsResult::Ok(versions)
}

// Chunked upload methods
#[ic_cdk_macros::update]
fn store_wasm_chunk(input: StoreWasmChunkInput) -> StoreWasmChunkResult {
    match state::store_wasm_chunk(input.version, input.chunk) {
        Ok(_) => StoreWasmChunkResult::Ok(()),
        Err(e) => StoreWasmChunkResult::Err(AppError::StoreWasmModuleFailed(e)),
    }
}

#[ic_cdk_macros::query]
fn get_wasm_chunk(input: GetWasmChunkInput) -> GetWasmChunkResult {
    match state::get_wasm_chunk(input.version, input.chunk_id) {
        Some(chunk) => GetWasmChunkResult::Ok(Some(chunk)),
        None => GetWasmChunkResult::Ok(None),
    }
}

#[ic_cdk_macros::update]
fn finish_wasm_upload(version: u32) -> FinishWasmUploadResult {
    match state::finish_wasm_upload(version) {
        Ok(_) => FinishWasmUploadResult::Ok(()),
        Err(e) => FinishWasmUploadResult::Err(AppError::StoreWasmModuleFailed(e)),
    }
}
