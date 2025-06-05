use ic_cdk_macros::init;

#[init]
fn init() {
    ic_cdk::println!("Upgrade canister: Initialization complete");
}
