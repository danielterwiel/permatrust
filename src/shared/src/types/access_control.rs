use crate::types::errors::AppError;
use candid::CandidType;
use serde::Deserialize;

#[derive(CandidType, Deserialize)]
pub struct RoleInput {
    pub name: String,
    pub description: String,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, Hash)]
pub enum Permission {
    Read,
    ReadAlls,
    Delete,
    Create,
    Update,
}

pub type RoleId = u64;
#[derive(CandidType, Deserialize)]
pub enum RoleIdResult {
    Ok(RoleId),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct Role {
    pub id: RoleId,
    pub permissions: Vec<EntityPermission>,
    pub name: String,
    pub description: String,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum UserAction {
    Create,
    Read,
    Update,
    Delete,
    Invite,
    Deactivate,
    ChangeRole,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum EntityPermission {
    User(Vec<Permission>),
}
