use candid::{CandidType, Principal};
use serde::Deserialize;

use crate::types::errors::AppError;
use crate::types::organizations::OrganizationId;
use crate::types::pagination::PaginationInput;
use crate::types::projects::ProjectId;

pub type UserId = u64;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct User {
    pub id: UserId,
    pub first_name: String,
    pub last_name: String,
    pub organizations: Vec<OrganizationId>,
    pub principals: Vec<Principal>,
}

// Inputs

#[derive(candid::CandidType, serde::Deserialize)]
pub struct UserIdInput {
    pub id: UserId,
}

#[derive(candid::CandidType, serde::Deserialize)]
pub struct ListProjectMembersRolesInput {
    pub project_id: ProjectId,
    pub pagination: PaginationInput,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateUserInput {
    pub first_name: String,
    pub last_name: String,
    pub organizations: Option<Vec<OrganizationId>>,
}

// Results

#[derive(CandidType, Deserialize)]
pub enum UserIdResult {
    Ok(UserId),
    Err(AppError),
}
