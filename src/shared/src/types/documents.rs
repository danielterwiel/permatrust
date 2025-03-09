use crate::types::errors::AppError;
use candid::CandidType;
use serde::Deserialize;

use crate::types::pagination::PaginationInput;
use crate::types::pagination::PaginationMetadata;
use crate::types::projects::ProjectId;
use crate::types::revisions::RevisionId;
use crate::types::users::UserId;

pub type DocumentId = u64;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Document {
    pub id: DocumentId,
    pub title: String,
    pub revisions: Vec<RevisionId>,
    pub created_at: u64,
    pub created_by: UserId,
    pub version: u8,
    pub project_id: ProjectId,
}

// Inputs

#[derive(CandidType, Deserialize)]
pub struct CreateDocumentInput {
    pub project_id: ProjectId,
    pub title: String,
    pub content: serde_bytes::ByteBuf,
}

#[derive(CandidType, Deserialize)]
pub struct ListDocumentsInput {
    pub project_id: ProjectId,
    pub pagination: PaginationInput,
}

#[derive(CandidType, Deserialize)]
pub struct ListDocumentsByProjectIdInput {
    pub project_id: ProjectId,
    pub pagination: PaginationInput,
}

#[derive(CandidType, Deserialize)]
pub struct DocumentIdInput {
    pub id: DocumentId,
}

// Results

#[derive(CandidType, Deserialize)]
pub enum DocumentIdResult {
    Ok(DocumentId),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum DocumentResult {
    Ok(Document),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum DocumentsResult {
    Ok(Vec<Document>),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub struct PaginatedDocumentsResultOk(pub Vec<Document>, pub PaginationMetadata);

#[derive(CandidType, Deserialize)]
pub enum PaginatedDocumentsResult {
    Ok(PaginatedDocumentsResultOk),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum CreateDocumentResult {
    Ok(DocumentId),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ListDocumentsResult {
    Ok((Vec<Document>, PaginationMetadata)),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ListDocumentsByProjectIdResult {
    Ok((Vec<Document>, PaginationMetadata)),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetDocumentResult {
    Ok(Document),
    Err(AppError),
}
