use candid::{CandidType, Principal};
use serde::Deserialize;

use crate::types::access_control::Role;
use crate::types::errors::AppError;
use crate::types::organizations::OrganizationId;

pub type UserId = u64;

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
    pub organizations: Vec<OrganizationId>,
    pub principal_id: Principal,
    pub roles: Vec<Role>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateUserInput {
    pub first_name: String,
    pub last_name: String,
}
