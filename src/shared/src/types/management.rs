use candid::{CandidType, Principal};
use serde::Deserialize;

use crate::types::errors::AppError;

use super::{
    organization::CreateOrganizationInput, projects::CreateProjectInput, users::CreateUserInput,
};

#[derive(CandidType, Deserialize, Debug)]
pub struct CreateTenantCanisterInput {
    pub user: CreateUserInput,
    pub organization: CreateOrganizationInput,
    pub project: CreateProjectInput,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct CreateInitTenantCanisterInput {
    pub user: CreateUserInput,
    pub organization: CreateOrganizationInput,
    pub project: CreateProjectInput,
    pub principal: Principal,
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
