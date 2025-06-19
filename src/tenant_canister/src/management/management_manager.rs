use candid::Principal;
use ic_cdk::api::canister_self;
use ic_cdk::call::Call;
use ic_cdk::futures::spawn;
use ic_cdk::management_canister::{install_code, CanisterInstallMode, InstallCodeArgs};
use shared::types::errors::AppError;
use shared::types::management::{
    GetAllWasmVersionsResult, GetWasmByVersionResult, GetWasmChunkInput, GetWasmChunkResult,
    UpgradeCanisterResult,
};
use shared::{log_debug, log_error, log_info, log_warn};

use crate::env;

pub struct ManagementManager {}

impl ManagementManager {
    fn get_upgrade_canister_principal() -> Principal {
        Principal::from_text(env::canister_id_upgrade()).expect("Invalid main canister ID")
    }

    async fn download_wasm_chunks(
        upgrade_canister_id: Principal,
        version: u32,
    ) -> Result<Vec<u8>, String> {
        log_debug!(
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
                log_debug!("Tenant canister: No chunks found, trying legacy get_wasm_by_version");
                return Self::download_wasm_legacy(upgrade_canister_id, version).await;
            }
            GetWasmChunkResult::Err(e) => {
                return Err(format!("Error getting first chunk: {:?}", e));
            }
        };

        let total_chunks = first_chunk.total_chunks;
        log_debug!(
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
                    log_debug!(
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

        log_debug!(
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
        log_debug!(
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

    pub async fn self_upgrade() -> UpgradeCanisterResult {
        let principal = ic_cdk::api::msg_caller();
        let upgrade_canister_id = Self::get_upgrade_canister_principal();

        log_warn!("security_alert: Canister upgrade initiated [principal={}, upgrade_canister={}, timestamp={}]",
                 principal, upgrade_canister_id, ic_cdk::api::time());

        // TODO: Add permission validation here when authorization system is implemented
        // log_debug!("access_control: Checking upgrade permissions [principal={}]", principal);

        log_info!(
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
                Ok(decoded) => {
                    log_debug!(
                        "upgrade_security: Successfully fetched version data [principal={}]",
                        principal
                    );
                    decoded
                }
                Err(e) => {
                    let err_msg = format!(
                        "Tenant canister: Failed to decode versions response: {:?}",
                        e
                    );
                    log_error!(
                        "upgrade_security: Version decoding failed [principal={}] - {}",
                        principal,
                        &err_msg
                    );
                    return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(err_msg));
                }
            },
            Err(e) => {
                let err_msg = format!(
                    "Tenant canister: Failed to call upgrade canister for versions: {:?}",
                    e
                );
                log_error!(
                    "upgrade_security: Version fetch failed [principal={}] - {}",
                    principal,
                    &err_msg
                );
                return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(err_msg));
            }
        };

        let versions = match versions_result {
            GetAllWasmVersionsResult::Ok(versions) => {
                log_info!(
                    "upgrade_security: Retrieved available versions [principal={}, version_count={}]",
                    principal,
                    versions.len()
                );
                versions
            }
            GetAllWasmVersionsResult::Err(e) => {
                let err_msg = format!(
                    "Tenant canister: Error getting versions from upgrade canister: {:?}",
                    e
                );
                log_error!(
                    "upgrade_security: Version retrieval error [principal={}] - {}",
                    principal,
                    &err_msg
                );
                return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(err_msg));
            }
        };

        // Get the latest version (highest number)
        let latest_version = match versions.iter().max() {
            Some(version) => {
                log_info!(
                    "upgrade_security: Selected latest version [principal={}, version={}]",
                    principal,
                    version
                );
                *version
            }
            None => {
                let err_msg = "Tenant canister: No WASM versions available for upgrade".to_string();
                log_error!(
                    "upgrade_security: No versions available [principal={}] - {}",
                    principal,
                    &err_msg
                );
                return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(err_msg));
            }
        };

        log_warn!(
            "upgrade_security: Proceeding with version [principal={}, version={}, upgrade_canister={}]",
            principal,
            latest_version,
            upgrade_canister_id
        );

        // 2. Fetch the WASM bytes for the latest version, try legacy first then chunked
        log_debug!(
            "upgrade_security: Initiating WASM download [principal={}, version={}]",
            principal,
            latest_version
        );

        let wasm_module = match Self::download_wasm_legacy(upgrade_canister_id, latest_version)
            .await
        {
            Ok(wasm_bytes) => {
                log_info!("upgrade_security: WASM downloaded successfully via legacy method [principal={}, size={}]",
                         principal, wasm_bytes.len());
                wasm_bytes
            }
            Err(legacy_error) => {
                log_warn!(
                    "upgrade_security: Legacy download failed, trying chunked [principal={}] - {}",
                    principal,
                    legacy_error
                );
                match Self::download_wasm_chunks(upgrade_canister_id, latest_version).await {
                    Ok(wasm_bytes) => {
                        log_info!("upgrade_security: WASM downloaded successfully via chunked method [principal={}, size={}]",
                                 principal, wasm_bytes.len());
                        wasm_bytes
                    }
                    Err(chunk_error) => {
                        let err_msg = format!(
                            "Tenant canister: Both download methods failed. Legacy: {}, Chunked: {}",
                            legacy_error, chunk_error
                        );
                        log_error!(
                            "upgrade_security: All download methods failed [principal={}] - {}",
                            principal,
                            &err_msg
                        );
                        return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(
                            err_msg,
                        ));
                    }
                }
            }
        };

        // Validate the WASM module (basic check)
        log_debug!(
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
            log_error!("upgrade_security: WASM validation failed - invalid format [principal={}, size={}] - {}",
                      principal, wasm_module.len(), &err_msg);
            return UpgradeCanisterResult::Err(AppError::CanisterUpgradeFailed(err_msg));
        }
        log_warn!("upgrade_security: WASM validation successful, proceeding with upgrade [principal={}, size={}, version={}]",
                 principal, wasm_module.len(), latest_version);

        // Get current canister ID for upgrade
        let current_canister_id = canister_self();

        let install_code_args = InstallCodeArgs {
            mode: CanisterInstallMode::Upgrade(None),
            canister_id: current_canister_id,
            wasm_module,
            arg: vec![], // Passed to #[post_upgrade]
        };

        log_info!(
            "Tenant canister: Preparing to install code in Upgrade mode on self ({}).",
            current_canister_id
        );

        // Use spawn to execute the upgrade asynchronously without waiting for callback
        log_warn!("upgrade_security: CRITICAL - Initiating canister upgrade [principal={}, canister_id={}, version={}]",
                 principal, current_canister_id, latest_version);

        // Spawn the install_code call to execute it in background
        spawn(async move {
            match install_code(&install_code_args).await {
                Ok(()) => {
                    log_warn!("upgrade_security: Canister upgrade completed successfully [principal={}, version={}]",
                             principal, latest_version);
                }
                Err(e) => {
                    log_error!(
                        "upgrade_security: Canister upgrade failed [principal={}, version={}] - {:?}",
                        principal,
                        latest_version,
                        e
                    );
                }
            }
        });

        // Return immediately - the upgrade will happen in the background
        log_warn!("upgrade_security: Canister upgrade initiated successfully [principal={}, returning_immediately=true]", principal);
        UpgradeCanisterResult::Ok(())
    }
}
