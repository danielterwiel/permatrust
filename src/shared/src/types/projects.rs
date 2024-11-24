use candid::CandidType;
use serde::Deserialize;

use crate::types::documents::DocumentId;
use crate::types::errors::AppError;
use crate::types::organisations::OrganisationId;
use crate::types::pagination::PaginationMetadata;
use crate::types::users::UserId;

pub type ProjectId = u64;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Project {
    pub id: ProjectId,
    pub documents: Vec<DocumentId>,
    pub members: Vec<UserId>,
    pub name: String,
    pub created_at: u64,
    pub created_by: UserId,
    pub organisations: Vec<OrganisationId>,
}

#[derive(CandidType, Deserialize)]
pub enum ProjectIdResult {
    Ok(ProjectId),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ProjectResult {
    Ok(Project),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub struct PaginatedProjectsResultOk(pub Vec<Project>, pub PaginationMetadata);

#[derive(CandidType, Deserialize)]
pub enum PaginatedProjectsResult {
    Ok(PaginatedProjectsResultOk),
    Err(AppError),
}
