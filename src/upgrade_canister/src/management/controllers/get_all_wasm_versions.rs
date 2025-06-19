use shared::types::management::GetAllWasmVersionsResult;

use crate::management::management_manager::ManagementManager;

#[ic_cdk_macros::query]
fn get_all_wasm_versions() -> GetAllWasmVersionsResult {
    let versions = ManagementManager::get_all_wasm_versions();
    GetAllWasmVersionsResult::Ok(versions)
}
