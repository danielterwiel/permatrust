use candid::CandidType;
use serde::Deserialize;

use crate::types::errors::AppError;
use crate::types::pagination::PaginationMetadata;
use crate::types::projects::ProjectId;
use crate::types::users::UserId;

pub type OrganizationId = u32;

#[derive(CandidType, Deserialize)]
pub enum OrganizationIdResult {
    Ok(OrganizationId),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Organization {
    pub id: OrganizationId,
    pub members: Vec<UserId>,
    pub projects: Vec<ProjectId>,
    pub name: String,
    pub created_at: u64,
    pub created_by: UserId,
}

#[derive(CandidType, Deserialize)]
pub enum OrganizationResult {
    Ok(Organization),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub struct PaginatedOrganizationsResultOk(pub Vec<Organization>, pub PaginationMetadata);

#[derive(CandidType, Deserialize)]
pub enum PaginatedOrganizationsResult {
    Ok(PaginatedOrganizationsResultOk),
    Err(AppError),
}
