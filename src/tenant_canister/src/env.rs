macro_rules! env_or_default {
    ($key:expr, $default:expr) => {
        option_env!($key).unwrap_or($default)
    };
}

pub fn canister_id_upgrade() -> &'static str {
    env_or_default!("CANISTER_ID_UPGRADE_CANISTER", "unknown")
}
