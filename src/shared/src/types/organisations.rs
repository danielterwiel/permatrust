use candid::CandidType;
use serde::Deserialize;

use crate::types::errors::AppError;
use crate::types::pagination::PaginationMetadata;
use crate::types::projects::ProjectId;
use crate::types::users::UserId;

pub type OrganisationId = u64;
#[derive(CandidType, Deserialize)]
pub enum OrganisationIdResult {
    Ok(OrganisationId),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Organisation {
    pub id: OrganisationId,
    pub members: Vec<UserId>,
    pub projects: Vec<ProjectId>,
    pub name: String,
    pub created_at: u64,
    pub created_by: UserId,
}

#[derive(CandidType, Deserialize)]
pub enum OrganisationResult {
    Ok(Organisation),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub struct PaginatedOrganisationsResultOk(pub Vec<Organisation>, pub PaginationMetadata);

#[derive(CandidType, Deserialize)]
pub enum PaginatedOrganisationsResult {
    Ok(PaginatedOrganisationsResultOk),
    Err(AppError),
}
