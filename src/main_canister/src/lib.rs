use crate::logs::logs_manager::LogsManager;
use crate::management::types::{
    CreateTenantCanisterInput, CreateTenantCanisterResult, GetAllTenantCanistersResult,
    GetTenantCanisterIdsResult,
};
use ic_cdk_macros::init;
use shared::log_info;
use shared::types::logs::CanisterOrigin;
use shared::types::logs::{ListLogsInput, ListLogsResult};
use shared::utils::logs::{init_logger, set_log_storage};

mod env;
mod logs;
mod management;

#[init]
fn init() {
    init_logger(CanisterOrigin::Main);
    let log_storage = LogsManager::init_log_storage();
    set_log_storage(log_storage);
    log_info!("initialization: Main canister initialized successfully");
}

ic_cdk::export_candid!();
