use candid::{CandidType, Principal};
use serde::Deserialize;

use crate::types::access_control::Role;
use crate::types::errors::AppError;
use crate::types::organisations::OrganisationId;
use crate::types::pagination::PaginationMetadata;

pub type UserId = Principal;

#[derive(CandidType, Deserialize)]
pub enum UserIdResult {
    Ok(UserId),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct User {
    pub id: UserId,
    pub first_name: String,
    pub last_name: String,
    pub organisations: Vec<OrganisationId>,
    pub roles: Vec<Role>,
}

#[derive(CandidType, Deserialize)]
pub enum UserResult {
    Ok(User),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum PaginatedUsersResult {
    Ok(Vec<User>, PaginationMetadata),
    Err(AppError),
}
