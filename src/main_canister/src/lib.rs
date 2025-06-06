use crate::logs::state::init_log_storage;
use crate::management::types::{
    CreateTenantCanisterInput, CreateTenantCanisterResult, GetAllTenantCanistersResult,
    GetTenantCanisterIdsResult,
};
use ic_cdk_macros::init;
use shared::log_info;
use shared::logging::{init_logger, set_log_storage, CanisterOrigin};
use shared::types::logs::{ListLogsInput, ListLogsResult};

mod env;
mod logs;
mod management;

#[init]
fn init() {
    init_logger(CanisterOrigin::Main);
    let log_storage = init_log_storage();
    set_log_storage(log_storage);
    log_info!("initialization: Main canister initialized successfully");
}

ic_cdk::export_candid!();
