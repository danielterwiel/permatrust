use candid::CandidType;
use serde::Deserialize;

use crate::types::documents::DocumentId;
use crate::types::errors::AppError;
use crate::types::pagination::{PaginationInput, PaginationMetadata};
use crate::types::projects::ProjectId;
use crate::types::users::UserId;

pub type RevisionId = u64;

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

// Inputs

#[derive(CandidType, Deserialize)]
pub struct CreateRevisionInput {
    pub project_id: ProjectId,
    pub document_id: DocumentId,
    pub content: serde_bytes::ByteBuf,
}

#[derive(CandidType, Deserialize)]
pub struct RevisionIdInput {
    pub id: RevisionId,
}

#[derive(CandidType, Deserialize)]
pub struct ListRevisionsInput {
    pub pagination: PaginationInput,
}

#[derive(CandidType, Deserialize)]
pub struct DiffRevisionsInput {
    pub original: RevisionId,
    pub updated: RevisionId,
}

// Results

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

#[derive(CandidType, Deserialize)]
pub enum CreateRevisionResult {
    Ok(RevisionId),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ListRevisionsResult {
    Ok((Vec<Revision>, PaginationMetadata)),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum DiffRevisionsResult {
    Ok(Vec<Revision>),
    Err(AppError),
}
