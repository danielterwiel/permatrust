use crate::logs::state::init_log_storage;
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use shared::log_info;
use shared::logging::{init_logger, set_log_storage, CanisterOrigin};

#[init]
fn init() {
    init_logger(CanisterOrigin::Upgrade);
    let log_storage = init_log_storage();
    set_log_storage(log_storage);
    log_info!("initialization: Upgrade canister initialized successfully");
}

#[pre_upgrade]
fn pre_upgrade() {
    log_info!("upgrade_start: Pre-upgrade initiated");
    // Stable structures handle persistence automatically
    log_info!("upgrade_complete: Pre-upgrade completed successfully");
}

#[post_upgrade]
fn post_upgrade() {
    init_logger(CanisterOrigin::Upgrade);
    let log_storage = init_log_storage();
    set_log_storage(log_storage);
    log_info!("upgrade_start: Post-upgrade initiated");
    log_info!("upgrade_complete: Upgrade canister post-upgrade completed successfully");
}
