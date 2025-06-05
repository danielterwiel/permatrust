use super::state::get_by_identity;
use super::types::{
    CreateTenantCanisterResult, GetAllTenantCanistersResult, GetTenantCanisterIdsResult,
};
use crate::management::state;
use ic_cdk::api::{canister_self, msg_caller};
use ic_cdk::management_canister::{
    create_canister, install_code, update_settings, CanisterInstallMode, CanisterSettings,
    CreateCanisterArgs, InstallCodeArgs, LogVisibility, UpdateSettingsArgs,
};
use ic_cdk_macros::{query, update};
use shared::types::errors::AppError;
use shared::types::management::{CreateInitTenantCanisterInput, CreateTenantCanisterInput};
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

// NOTE: admin only
#[query]
pub fn get_all_tenant_canister_ids() -> GetAllTenantCanistersResult {
    GetAllTenantCanistersResult::Ok(state::get_all_tenant_canister_ids())
}

#[update]
pub async fn create_tenant_canister(
    input: CreateTenantCanisterInput,
) -> CreateTenantCanisterResult {
    let caller = msg_caller();
    let main_canister = canister_self();
    let local_identity = crate::env::local_identity();

    let create_settings = CanisterSettings {
        compute_allocation: None,
        memory_allocation: None,
        freezing_threshold: None,
        // TODO: review
        controllers: Some(vec![main_canister, caller, local_identity]),
        reserved_cycles_limit: None,
        log_visibility: Some(LogVisibility::Controllers),
        wasm_memory_limit: None,
        wasm_memory_threshold: None,
    };
    let create_args = CreateCanisterArgs {
        settings: Some(create_settings),
    };

    match create_canister(&create_args).await {
        Ok(canister_id_record) => {
            let canister_id = canister_id_record.canister_id;
            let principal = ic_cdk::api::msg_caller();

            let updated_controllers = vec![main_canister, caller, canister_id, local_identity];

            let update_settings_for_self_control = CanisterSettings {
                controllers: Some(updated_controllers),
                // Set other fields to None to leave them unchanged from creation defaults
                // or their current values if they were set differently during creation.
                compute_allocation: None,
                memory_allocation: None,
                freezing_threshold: None,
                reserved_cycles_limit: None,
                log_visibility: Some(LogVisibility::Controllers),
                wasm_memory_limit: None,
                wasm_memory_threshold: None,
            };

            let update_arg = UpdateSettingsArgs {
                canister_id,
                settings: update_settings_for_self_control,
            };

            if let Err(err) = update_settings(&update_arg).await {
                let error_msg = format!(
                    "Failed to update settings for {} to add self as controller: {:?}",
                    canister_id, err
                );
                ic_cdk::eprintln!("{}", error_msg);
                // Optionally, delete the canister if setup fails critically
                // delete_canister(CanisterIdRecord { canister_id: new_canister_id }).await.ok();
                return CreateTenantCanisterResult::Err(AppError::SpawnCanister(error_msg));
            }
            ic_cdk::println!("Successfully set {} as its own controller.", canister_id);

            let init_arg_args = CreateInitTenantCanisterInput {
                user: input.user,
                organization: input.organization,
                project: input.project,
                principal,
                main_canister_id: main_canister,
            };

            let init_arg =
                candid::encode_one(&init_arg_args).expect("Failed to serialize init args");

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
