use candid::CandidType;
use serde::Deserialize;

use crate::types::errors::AppError;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UpgradeCanisterInput {
    pub wasm_module: Vec<u8>,
    // TODO: include version, hash, etc., for more checks
}

#[derive(CandidType, Deserialize, Debug)]
pub enum UpgradeCanisterResult {
    Ok(()),
    Err(AppError),
}
