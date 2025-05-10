use candid::{CandidType, Principal};
use serde::Deserialize;

use crate::types::access_control::Role;
use crate::types::errors::AppError;
use crate::types::pagination::PaginationInput;

use super::pagination::PaginationMetadata;

pub type UserId = u8;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct User {
    pub id: UserId,
    pub first_name: String,
    pub last_name: String,
    pub principals: Vec<Principal>,
    pub roles: Vec<Role>,
}

// Inputs

#[derive(CandidType, serde::Deserialize)]
pub struct UserIdInput {
    pub id: UserId,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateUserInput {
    pub first_name: String,
    pub last_name: String,
}

#[derive(CandidType, Deserialize)]
pub struct ListUsersInput {
    pub pagination: PaginationInput,
}

#[derive(CandidType, Deserialize)]
pub struct GetUserResultOk {
    pub user: User,
}

// Results

#[derive(CandidType, Deserialize)]
pub enum UserIdResult {
    Ok(UserId),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum CreateUserResult {
    Ok(User),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ListUsersResult {
    Ok((Vec<User>, PaginationMetadata)),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetUserResult {
    Ok(User),
    Err(AppError),
}
