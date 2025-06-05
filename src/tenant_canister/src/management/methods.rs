use candid::Principal;
use ic_cdk::api::canister_self;
use ic_cdk::call::Call;
use ic_cdk::futures::spawn;
use ic_cdk::management_canister::{install_code, CanisterInstallMode, InstallCodeArgs};
use ic_cdk_macros::update;
use shared::types::errors::AppError;
use shared::types::management::{
    GetAllWasmVersionsResult, GetWasmByVersionResult, GetWasmChunkInput, GetWasmChunkResult,
    UpgradeCanisterResult,
};

use crate::env;

fn get_upgrade_canister_principal() -> Principal {
    Principal::from_text(env::canister_id_upgrade()).expect("Invalid main canister ID")
}

async fn download_wasm_chunks(
    upgrade_canister_id: Principal,
    version: u32,
) -> Result<Vec<u8>, String> {
    ic_cdk::println!(
        "Tenant canister: Starting chunked download for version {}",
        version
    );

    // First, try to get the first chunk to determine total chunks
    let first_chunk_input = GetWasmChunkInput {
        version,
        chunk_id: 0,
    };

    let first_chunk_response = Call::unbounded_wait(upgrade_canister_id, "get_wasm_chunk")
        .with_args(&(first_chunk_input,))
        .await
        .map_err(|e| format!("Failed to call get_wasm_chunk: {:?}", e))?;

    let first_chunk_result: GetWasmChunkResult = first_chunk_response
        .candid()
        .map_err(|e| format!("Failed to decode first chunk response: {:?}", e))?;

    let first_chunk = match first_chunk_result {
        GetWasmChunkResult::Ok(Some(chunk)) => chunk,
        GetWasmChunkResult::Ok(None) => {
            // Fallback to old API if chunked version doesn't exist
            ic_cdk::println!("Tenant canister: No chunks found, trying legacy get_wasm_by_version");
            return download_wasm_legacy(upgrade_canister_id, version).await;
        }
        GetWasmChunkResult::Err(e) => {
            return Err(format!("Error getting first chunk: {:?}", e));
        }
    };

    let total_chunks = first_chunk.total_chunks;
    ic_cdk::println!(
        "Tenant canister: Total chunks to download: {}",
        total_chunks
    );

    // Download all chunks
    let mut wasm_bytes = Vec::new();
    let mut chunks = vec![None; total_chunks as usize];

    // Store the first chunk
    chunks[0] = Some(first_chunk.data);

    // Download remaining chunks
    for chunk_id in 1..total_chunks {
        let chunk_input = GetWasmChunkInput { version, chunk_id };

        let chunk_response = Call::unbounded_wait(upgrade_canister_id, "get_wasm_chunk")
            .with_args(&(chunk_input,))
            .await
            .map_err(|e| {
                format!(
                    "Failed to call get_wasm_chunk for chunk {}: {:?}",
                    chunk_id, e
                )
            })?;

        let chunk_result: GetWasmChunkResult = chunk_response
            .candid()
            .map_err(|e| format!("Failed to decode chunk {} response: {:?}", chunk_id, e))?;

        match chunk_result {
            GetWasmChunkResult::Ok(Some(chunk)) => {
                chunks[chunk_id as usize] = Some(chunk.data);
                ic_cdk::println!(
                    "Tenant canister: Downloaded chunk {}/{}",
                    chunk_id + 1,
                    total_chunks
                );
            }
            GetWasmChunkResult::Ok(None) => {
                return Err(format!("Chunk {} not found", chunk_id));
            }
            GetWasmChunkResult::Err(e) => {
                return Err(format!("Error getting chunk {}: {:?}", chunk_id, e));
            }
        }
    }

    // Reassemble chunks
    for (i, chunk_data) in chunks.into_iter().enumerate() {
        match chunk_data {
            Some(data) => wasm_bytes.extend(data),
            None => return Err(format!("Missing chunk {}", i)),
        }
    }

    ic_cdk::println!(
        "Tenant canister: Successfully downloaded {} bytes in {} chunks",
        wasm_bytes.len(),
        total_chunks
    );
    Ok(wasm_bytes)
}

async fn download_wasm_legacy(
    upgrade_canister_id: Principal,
    version: u32,
) -> Result<Vec<u8>, String> {
    ic_cdk::println!(
        "Tenant canister: Using legacy download for version {}",
        version
    );

    let wasm_response_result = Call::unbounded_wait(upgrade_canister_id, "get_wasm_by_version")
        .with_args(&(version,))
        .await
        .map_err(|e| format!("Failed to call get_wasm_by_version: {:?}", e))?;

    let wasm_result: GetWasmByVersionResult = wasm_response_result
        .candid()
        .map_err(|e| format!("Failed to decode WASM response: {:?}", e))?;

    match wasm_result {
        GetWasmByVersionResult::Ok(Some(wasm_bytes)) => Ok(wasm_bytes),
        GetWasmByVersionResult::Ok(None) => Err(format!("WASM version {} not found", version)),
        GetWasmByVersionResult::Err(e) => Err(format!("Error getting WASM: {:?}", e)),
    }
}

#[update]
async fn self_upgrade() -> UpgradeCanisterResult {
    let upgrade_canister_id = get_upgrade_canister_principal();

    ic_cdk::println!(
        "Tenant canister: Attempting self-upgrade. Fetching Wasm from upgrade canister: {}",
        upgrade_canister_id
    );

    // 1. Get available WASM versions from the upgrade canister
    let versions_response_result =
        Call::unbounded_wait(upgrade_canister_id, "get_all_wasm_versions")
            .with_args(&())
            .await;

    let versions_result: GetAllWasmVersionsResult = match versions_response_result {
        Ok(result) => match result.candid() {
            Ok(decoded) => decoded,
            Err(e) => {
                let err_msg = format!(
                    "Tenant canister: Failed to decode versions response: {:?}",
                    e
                );
                ic_cdk::eprintln!("{}", &err_msg);
                return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(err_msg));
            }
        },
        Err(e) => {
            let err_msg = format!(
                "Tenant canister: Failed to call upgrade canister for versions: {:?}",
                e
            );
            ic_cdk::eprintln!("{}", &err_msg);
            return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(err_msg));
        }
    };

    let versions = match versions_result {
        GetAllWasmVersionsResult::Ok(versions) => versions,
        GetAllWasmVersionsResult::Err(e) => {
            let err_msg = format!(
                "Tenant canister: Error getting versions from upgrade canister: {:?}",
                e
            );
            ic_cdk::eprintln!("{}", &err_msg);
            return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(err_msg));
        }
    };

    // Get the latest version (highest number)
    let latest_version = match versions.iter().max() {
        Some(version) => *version,
        None => {
            let err_msg = "Tenant canister: No WASM versions available for upgrade".to_string();
            ic_cdk::eprintln!("{}", &err_msg);
            return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(err_msg));
        }
    };

    ic_cdk::println!(
        "Tenant canister: Latest WASM version available: {}",
        latest_version
    );

    // 2. Fetch the WASM bytes for the latest version, try legacy first then chunked
    let wasm_module = match download_wasm_legacy(upgrade_canister_id, latest_version).await {
        Ok(wasm_bytes) => {
            ic_cdk::println!("Tenant canister: Successfully downloaded WASM using legacy method");
            wasm_bytes
        }
        Err(legacy_error) => {
            ic_cdk::println!(
                "Tenant canister: Legacy download failed: {}, trying chunked download",
                legacy_error
            );
            match download_wasm_chunks(upgrade_canister_id, latest_version).await {
                Ok(wasm_bytes) => wasm_bytes,
                Err(chunk_error) => {
                    let err_msg = format!(
                        "Tenant canister: Both download methods failed. Legacy: {}, Chunked: {}",
                        legacy_error, chunk_error
                    );
                    ic_cdk::eprintln!("{}", &err_msg);
                    return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(err_msg));
                }
            }
        }
    };

    // Validate the WASM module (basic check)
    ic_cdk::println!(
        "Tenant canister: WASM module length: {}, first 8 bytes: {:?}",
        wasm_module.len(),
        if wasm_module.len() >= 8 {
            &wasm_module[0..8]
        } else {
            &wasm_module[..]
        }
    );

    if wasm_module.len() < 4 || &wasm_module[0..4] != b"\0asm" {
        let err_msg =
            format!(
            "Tenant canister: Invalid WASM module format received. Length: {}, first 4 bytes: {:?}",
            wasm_module.len(),
            if wasm_module.len() >= 4 { &wasm_module[0..4] } else { &wasm_module[..] }
        );
        ic_cdk::eprintln!("{}", &err_msg);
        return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(err_msg));
    }
    ic_cdk::println!(
        "Tenant canister: Successfully fetched and validated WASM ({} bytes).",
        wasm_module.len()
    );

    // Get current canister ID for upgrade
    let current_canister_id = canister_self();

    let install_code_args = InstallCodeArgs {
        mode: CanisterInstallMode::Upgrade(None),
        canister_id: current_canister_id,
        wasm_module,
        arg: vec![], // Passed to #[post_upgrade]
    };

    ic_cdk::println!(
        "Tenant canister: Preparing to install code in Upgrade mode on self ({}).",
        current_canister_id
    );

    // Use spawn to execute the upgrade asynchronously without waiting for callback
    ic_cdk::println!("Tenant canister: Initiating self-upgrade...");

    // Spawn the install_code call to execute it in background
    spawn(async move {
        match install_code(&install_code_args).await {
            Ok(()) => {
                ic_cdk::println!("Tenant canister: Self-upgrade completed successfully");
            }
            Err(e) => {
                ic_cdk::println!("Tenant canister: Self-upgrade failed: {:?}", e);
            }
        }
    });

    // Return immediately - the upgrade will happen in the background
    ic_cdk::println!("Tenant canister: Self-upgrade call initiated successfully");
    UpgradeCanisterResult::Ok(())
}
