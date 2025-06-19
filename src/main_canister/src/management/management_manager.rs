use candid::Principal;
use ic_cdk::api::{canister_self, msg_caller};
use ic_cdk::management_canister::{
    create_canister, install_code, update_settings, CanisterInstallMode, CanisterSettings,
    CreateCanisterArgs, InstallCodeArgs, LogVisibility, UpdateSettingsArgs,
};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::consts::memory_ids::main_canister::IDENTITY_TENANT_MAP_MEMORY_ID;
use shared::types::errors::AppError;
use shared::types::management::{CreateInitTenantCanisterInput, CreateTenantCanisterInput};
use shared::{log_error, log_info};
use std::cell::RefCell;
use std::option::Option::Some;

use super::types::{
    CreateTenantCanisterResult, GetAllTenantCanistersResult, GetTenantCanisterIdsResult,
};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static IDENTITY_TENANT_MAP: RefCell<StableBTreeMap<Principal, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(IDENTITY_TENANT_MAP_MEMORY_ID))),
        )
    );
}

const TENANT_CANISTER_WASM: &[u8] =
    include_bytes!("../../../../.dfx/local/canisters/tenant_canister/tenant_canister.wasm");

pub struct ManagementManager {}

impl ManagementManager {
    // NOTE: admin only
    pub fn get_all_tenant_canister_ids() -> Vec<Principal> {
        IDENTITY_TENANT_MAP.with(|tenants| {
            tenants
                .borrow()
                .iter()
                .map(|(_identity, tenant_canister_id)| tenant_canister_id)
                .collect()
        })
    }

    pub fn get_by_identity(identity: Principal) -> Option<Principal> {
        IDENTITY_TENANT_MAP.with(|projects| projects.borrow().get(&identity))
    }

    pub fn insert(identity: Principal, tenant_canister_id: Principal) {
        IDENTITY_TENANT_MAP.with(|tenants| {
            tenants.borrow_mut().insert(identity, tenant_canister_id);
        });
    }

    pub fn get_tenant_canister_ids() -> GetTenantCanisterIdsResult {
        let principal = msg_caller();

        match Self::get_by_identity(principal) {
            Some(identity) => GetTenantCanisterIdsResult::Ok(vec![identity]),
            None => GetTenantCanisterIdsResult::Err(AppError::IdentityNotFound),
        }
    }

    // NOTE: admin only
    pub fn get_all_tenant_canister_ids_result() -> GetAllTenantCanistersResult {
        GetAllTenantCanistersResult::Ok(Self::get_all_tenant_canister_ids())
    }

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
                    log_error!("{}", error_msg);
                    // Optionally, delete the canister if setup fails critically
                    // delete_canister(CanisterIdRecord { canister_id: new_canister_id }).await.ok();
                    return CreateTenantCanisterResult::Err(AppError::SpawnCanister(error_msg));
                }
                log_info!("Successfully set {} as its own controller.", canister_id);

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
                        log_info!(
                            "Successfully created and installed business logic on canister ID: {}",
                            canister_id
                        );

                        Self::insert(caller, canister_id);
                        log_info!(
                            "Mapped caller {} to tenant canister {}",
                            caller,
                            canister_id
                        );

                        CreateTenantCanisterResult::Ok(canister_id)
                    }
                    Err(error) => {
                        log_error!("Error installing code on {} - {:?}", canister_id, error);
                        // TODO: Consider calling delete_canister for cleanup
                        CreateTenantCanisterResult::Err(AppError::SpawnCanister(format!(
                            "Failed to install code on {} - {:?}",
                            canister_id, error
                        )))
                    }
                }
            }
            Err(error) => {
                log_error!("Error creating canister: {:?}", error);
                CreateTenantCanisterResult::Err(AppError::SpawnCanister(format!(
                    "Failed to create canister: {:?}",
                    error
                )))
            }
        }
    }
}
