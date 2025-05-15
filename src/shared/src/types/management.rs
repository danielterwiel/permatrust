use candid::CandidType;
use serde::Deserialize;

use crate::types::errors::AppError;

use super::{
    organization::CreateOrganizationInput, projects::CreateProjectInput, users::CreateUserInput,
};

#[derive(CandidType, Deserialize, Debug)]
pub struct CreateCanisterTenantInput {
    pub organization: CreateOrganizationInput,
    pub project: CreateProjectInput,
    pub user: CreateUserInput,
}

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
