use candid::CandidType;
use serde::Deserialize;

use crate::types::documents::DocumentId;
use crate::types::errors::AppError;
use crate::types::pagination::PaginationMetadata;
use crate::types::projects::ProjectId;
use crate::types::users::UserId;

pub type RevisionId = u64;
#[derive(CandidType, Deserialize)]
pub enum RevisionIdResult {
    Ok(RevisionId),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Revision {
    pub id: RevisionId,
    pub content: serde_bytes::ByteBuf,
    pub document_id: DocumentId,
    pub created_at: u64,
    pub created_by: UserId,
    pub version: u8,
    pub project_id: ProjectId,
}
#[derive(CandidType, Deserialize)]
pub enum RevisionsResult {
    Ok(Vec<Revision>),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum RevisionResult {
    Ok(Revision),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub struct PaginatedRevisionsResultOk(pub Vec<Revision>, pub PaginationMetadata);

#[derive(CandidType, Deserialize)]
pub enum PaginatedRevisionsResult {
    Ok(PaginatedRevisionsResultOk),
    Err(AppError),
}
