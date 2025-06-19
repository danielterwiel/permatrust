use shared::types::management::{GetWasmChunkInput, GetWasmChunkResult};

use crate::management::management_manager::ManagementManager;

#[ic_cdk_macros::query]
fn get_wasm_chunk(input: GetWasmChunkInput) -> GetWasmChunkResult {
    match ManagementManager::get_wasm_chunk(input.version, input.chunk_id) {
        Some(chunk) => GetWasmChunkResult::Ok(Some(chunk)),
        None => GetWasmChunkResult::Ok(None),
    }
}
