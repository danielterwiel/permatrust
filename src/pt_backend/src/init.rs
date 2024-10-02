use crate::logger::init_logger;
use ic_cdk_macros::init;

#[init]
fn init() {
    init_logger();
}
