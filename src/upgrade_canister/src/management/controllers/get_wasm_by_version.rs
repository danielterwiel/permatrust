use shared::types::management::GetWasmByVersionResult;
use shared::{log_debug, log_info};

use crate::management::management_manager::ManagementManager;

#[ic_cdk_macros::query]
fn get_wasm_by_version(version: u32) -> GetWasmByVersionResult {
    match ManagementManager::get_wasm_by_version(version) {
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
