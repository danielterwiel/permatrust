use super::state::get_by_identity;
use super::types::{
    CreateTenantCanisterInput, CreateTenantCanisterResult, GetTenantCanisterIdsResult,
};
use ic_cdk::api::{canister_self, msg_caller};
use ic_cdk::management_canister::{
    create_canister, install_code, CanisterInstallMode, CanisterSettings, CreateCanisterArgs,
    InstallCodeArgs, LogVisibility,
};
use ic_cdk_macros::{query, update};
use shared::types::errors::AppError;
use shared::types::tenant::TenantInitArgs;
use std::option::Option::Some;

const TENANT_CANISTER_WASM: &[u8] =
    include_bytes!("../../../../.dfx/local/canisters/tenant_canister/tenant_canister.wasm");

#[query]
pub fn get_tenant_canister_ids() -> GetTenantCanisterIdsResult {
    let principal = msg_caller();

    match get_by_identity(principal) {
        Some(identity) => GetTenantCanisterIdsResult::Ok(vec![identity]),
        None => GetTenantCanisterIdsResult::Err(AppError::IdentityNotFound),
    }
}

#[update]
pub async fn create_tenant_canister(
    input: CreateTenantCanisterInput,
) -> CreateTenantCanisterResult {
    let caller = msg_caller();
    let canister = canister_self();

    let create_settings = CanisterSettings {
        compute_allocation: None,
        memory_allocation: None,
        freezing_threshold: None,
        controllers: Some(vec![canister, caller]),
        reserved_cycles_limit: None,
        log_visibility: std::option::Option::Some(LogVisibility::Controllers),
        wasm_memory_limit: None,
        wasm_memory_threshold: None,
    };
    let create_args = CreateCanisterArgs {
        settings: Some(create_settings),
    };

    match create_canister(&create_args).await {
        Ok(canister_id_record) => {
            let canister_id = canister_id_record.canister_id;

            let init_args_struct = TenantInitArgs {
                company_name: input.company_name,
            };

            let init_arg =
                candid::encode_one(&init_args_struct).expect("Failed to serialize init args");

            let install_args = InstallCodeArgs {
                mode: CanisterInstallMode::Install,
                canister_id,
                wasm_module: TENANT_CANISTER_WASM.to_vec(),
                arg: init_arg,
            };

            match install_code(&install_args).await {
                Ok(()) => {
                    ic_cdk::println!(
                        "Successfully created and installed business logic on canister ID: {}",
                        canister_id
                    );

                    crate::management::state::insert(caller, canister_id);
                    ic_cdk::println!(
                        "Mapped caller {} to tenant canister {}",
                        caller,
                        canister_id
                    );

                    CreateTenantCanisterResult::Ok(canister_id)
                }
                Err(error) => {
                    ic_cdk::eprintln!("Error installing code on {} - {:?}", canister_id, error);
                    // TODO: Consider calling delete_canister for cleanup
                    CreateTenantCanisterResult::Err(AppError::SpawnCanister(format!(
                        "Failed to install code on {} - {:?}",
                        canister_id, error
                    )))
                }
            }
        }
        Err(error) => {
            ic_cdk::eprintln!("Error creating canister: {:?}", error);
            CreateTenantCanisterResult::Err(AppError::SpawnCanister(format!(
                "Failed to create canister: {:?}",
                error
            )))
        }
    }
}
