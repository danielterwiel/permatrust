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
#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum EntityPermission {
    User(Vec<Permission>),
}

pub type RoleId = u64;
#[derive(CandidType, Deserialize)]
pub enum RoleIdResult {
    Ok(RoleId),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Role {
    pub id: RoleId,
    pub permissions: Vec<EntityPermission>,
    pub name: String,
    pub description: String,
}
