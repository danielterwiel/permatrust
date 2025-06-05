use candid::{CandidType, Principal};
use serde::Deserialize;
use shared::types::{
    errors::AppError, organization::CreateOrganizationInput, projects::CreateProjectInput,
    users::CreateUserInput,
};

#[derive(CandidType, Deserialize)]
pub struct CreateTenantCanisterInput {
    organization: CreateOrganizationInput,
    project: CreateProjectInput,
    user: CreateUserInput,
}

#[derive(CandidType, Deserialize)]
pub enum CreateTenantCanisterResult {
    Ok(Principal),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetTenantCanisterIdsResult {
    Ok(Vec<Principal>),
    Err(AppError),
}

// NOTE: admin only
#[derive(CandidType, Deserialize)]
pub enum GetAllTenantCanistersResult {
    Ok(Vec<Principal>),
    Err(AppError),
}
