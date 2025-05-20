use base64::{engine::general_purpose::URL_SAFE_NO_PAD, Engine as _};
use candid::Principal;
use ic_cdk::call::Call;

async fn generate_random_bytes(length: usize) -> Vec<u8> {
    let seed = Call::unbounded_wait(Principal::management_canister(), "raw_rand")
        .await
        .expect("Failed to call the management canister");

    if seed.len() < length {
        // raw_rand is documented to return at least 32 bytes, but robust code
        // should handle the possibility of fewer bytes being returned,
        // especially for very large requested lengths or if the API behavior changes.
        // For small lengths like 16 or 32, getting fewer bytes is highly improbable,
        // but trapping is a reasonable action here.
        ic_cdk::trap("Not enough random bytes returned from raw_rand");
    }

    seed[0..length].to_vec()
}

pub async fn random(length: usize) -> String {
    if length == 0 {
        return String::new();
    }
    let random_bytes = generate_random_bytes(length).await;
    URL_SAFE_NO_PAD.encode(&random_bytes)
}
