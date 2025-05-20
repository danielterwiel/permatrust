use candid::CandidType;
use serde::Deserialize;

use crate::types::errors::AppError;
use crate::types::projects::ProjectId;
use crate::types::users::UserId;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Organization {
    pub name: String,
    pub members: Vec<UserId>,
    pub projects: Vec<ProjectId>,
    pub created_at: u64,
    pub created_by: UserId,
}

// Inputs

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateOrganizationInput {
    pub name: String,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateInitOrganizationInput {
    pub name: String,
    pub members: Vec<UserId>,
    pub projects: Vec<ProjectId>,
    pub created_by: UserId,
}

// Results

#[derive(CandidType, Deserialize)]
pub enum CreateOrganizationResult {
    Ok(Organization),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetOrganizationResult {
    Ok(Organization),
    Err(AppError),
}
