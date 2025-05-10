use candid::{CandidType, Principal};
use serde::Deserialize;
use shared::types::errors::AppError;

#[derive(CandidType, Deserialize, Clone)]
pub struct CreateTenantCanisterInput {
    pub company_name: String,
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
