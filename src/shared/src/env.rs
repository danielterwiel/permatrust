use dotenv::dotenv;
use std::collections::HashMap;

#[allow(clippy::option_env_unwrap)]
pub fn env_map() -> HashMap<&'static str, String> {
    dotenv().ok();

    let mut env_map = HashMap::new();
    env_map.insert(
        "CANISTER_ID_PT_BACKEND",
        option_env!("CANISTER_ID_PT_BACKEND")
            .expect("CANISTER_ID_PT_BACKEND not found")
            .to_string(),
    );

    env_map
}

pub fn get_env(key: &str) -> String {
    let env_map = env_map();
    env_map.get(key).expect("Key not found").to_string()
}

pub fn get_env_principal(key: &str) -> candid::Principal {
    let env_map = env_map();
    let canister_id = env_map.get(key).expect("Key not found");
    candid::Principal::from_text(canister_id).expect("Principal expect")
}
