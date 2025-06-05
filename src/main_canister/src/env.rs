use candid::Principal;

macro_rules! env_or_default {
    ($key:expr, $default:expr) => {
        option_env!($key).unwrap_or($default)
    };
}

// TODO: review in production
// IMPORTANT!!!: Create a new identity for production
/// Local development identity principal
/// Set via LOCAL_IDENTITY environment variable
pub fn local_identity() -> Principal {
    let identity_str = env_or_default!(
        "LOCAL_IDENTITY",
        "4utfr-vvzwz-h62h4-xxl23-jvlck-dxw5q-je4tf-t6nr4-nk7ry-rywf6-bae"
    );

    Principal::from_text(identity_str).expect("Invalid LOCAL_IDENTITY principal format")
}
