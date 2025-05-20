use candid::CandidType;
use serde::Deserialize;

use crate::types::documents::DocumentId;
use crate::types::errors::AppError;
use crate::types::pagination::PaginationInput;
use crate::types::pagination::PaginationMetadata;
use crate::types::users::{User, UserId};

pub type ProjectId = u32;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Project {
    pub id: ProjectId,
    pub documents: Vec<DocumentId>,
    pub members: Vec<UserId>,
    pub name: String,
    pub created_at: u64,
    pub created_by: UserId,
}

// Inputs
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ProjectIdInput {
    pub id: ProjectId,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateProjectInput {
    pub name: String,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct CreateInitProjectInput {
    pub name: String,
    pub members: Vec<UserId>,
    pub created_by: UserId,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ListProjectMembersInput {
    pub pagination: PaginationInput,
}

// Results
#[derive(CandidType, Deserialize)]
pub enum CreateProjectResult {
    Ok(ProjectId),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetProjectsResult {
    Ok(Vec<Project>),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ListProjectsResult {
    Ok((Vec<Project>, PaginationMetadata)),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ListProjectMembersResult {
    Ok((Vec<User>, PaginationMetadata)),
    Err(AppError),
}
