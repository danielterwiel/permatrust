use candid::CandidType;
use serde::{Deserialize, Serialize};

use crate::types::documents::DocumentId;
use crate::types::errors::AppError;
use crate::types::pagination::{PaginationInput, PaginationMetadata};
use crate::types::projects::ProjectId;
use crate::types::users::UserId;

pub type RevisionId = u64;
pub type RevisionContentId = u64;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Revision {
    pub id: RevisionId,
    pub contents: Vec<RevisionContentId>,
    pub document_id: DocumentId,
    pub created_at: u64,
    pub created_by: UserId,
    pub version: u8,
    pub project_id: ProjectId,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct RevisionContent {
    pub id: RevisionContentId,
    pub file_name: Option<String>,
    pub content_type: RevisionContentType,
    /// Content data - None means reference existing content by ID (optimization for unchanged content)
    /// Security note: When None, the backend MUST validate that the ID references content the user has access to
    pub content_data: Option<RevisionContentData>,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum RevisionContentData {
    Direct {
        bytes: Vec<u8>,
    },
    Chunked {
        total_size: u64,
        total_chunks: u32,
        revision_id: RevisionId,
        content_index: u32,
    },
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub struct RevisionContentChunk {
    pub chunk_id: u32,
    pub total_chunks: u32,
    pub data: Vec<u8>,
    pub checksum: Option<String>, // SHA-256 checksum for integrity
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub struct RevisionContentMetadata {
    pub revision_id: RevisionId,
    pub content_index: u32,
    pub total_chunks: u32,
    pub total_size: u64,
    pub content_type: RevisionContentType,
    pub file_name: Option<String>,
    pub is_complete: bool,
}

#[derive(CandidType, Serialize, Deserialize, Clone, Debug)]
pub enum RevisionContentType {
    Markdown,
    Upload,
}

// Inputs

#[derive(CandidType, Deserialize)]
pub struct CreateRevisionInput {
    pub project_id: ProjectId,
    pub document_id: DocumentId,
    pub contents: Vec<RevisionContent>,
}

#[derive(CandidType, Deserialize)]
pub struct StoreRevisionContentChunkInput {
    pub revision_id: RevisionId,
    pub content_index: u32,
    pub chunk: RevisionContentChunk,
    pub content_type: RevisionContentType,
    pub file_name: Option<String>,
}

#[derive(CandidType, Deserialize)]
pub struct GetRevisionContentChunkInput {
    pub revision_id: RevisionId,
    pub content_index: u32,
    pub chunk_id: u32,
}

#[derive(CandidType, Deserialize)]
pub struct FinishRevisionContentUploadInput {
    pub revision_id: RevisionId,
    pub content_index: u32,
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

#[derive(CandidType, Deserialize)]
pub struct GetRevisionContentInput {
    pub content_id: RevisionContentId,
}

#[derive(CandidType, Deserialize)]
pub struct ListRevisionContentsInput {
    pub revision_id: RevisionId,
}

#[derive(CandidType, Deserialize)]
pub struct DownloadRevisionContentInput {
    pub content_id: RevisionContentId,
    pub chunk_id: Option<u32>, // None for direct content, Some(chunk_id) for chunked content
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
pub enum StoreRevisionContentChunkResult {
    Ok(()),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetRevisionContentChunkResult {
    Ok(Option<RevisionContentChunk>),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum FinishRevisionContentUploadResult {
    Ok(()),
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

#[derive(CandidType, Deserialize)]
pub enum GetRevisionContentResult {
    Ok(RevisionContent),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ListRevisionContentsResult {
    Ok(Vec<RevisionContent>),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum DownloadRevisionContentResult {
    Ok(Vec<u8>), // Raw bytes for either direct content or a single chunk
    Err(AppError),
}
