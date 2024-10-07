// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports)]
use candid::{self, CandidType, Deserialize, Principal};
use ic_cdk::api::call::CallResult as Result;

pub type ProjectId = u64;
pub type DocumentId = u64;
#[derive(CandidType, Deserialize, Debug)]
pub enum AppError {
  InvalidPageSize(String),
  EntityNotFound(String),
  InvalidPageNumber(String),
  Unauthorized,
  InternalError(String),
}
#[derive(CandidType, Deserialize)]
pub enum DocumentIdResult { Ok(DocumentId), Err(AppError) }
pub type OrganisationId = u64;
#[derive(CandidType, Deserialize)]
pub enum OrganisationIdResult { Ok(OrganisationId), Err(AppError) }
#[derive(CandidType, Deserialize)]
pub enum ProjectIdResult { Ok(ProjectId), Err(AppError) }
pub type RevisionId = u64;
#[derive(CandidType, Deserialize)]
pub enum RevisionIdResult { Ok(RevisionId), Err(AppError) }
pub type UserId = Principal;
#[derive(CandidType, Deserialize)]
pub enum UserIdResult { Ok(UserId), Err(AppError) }
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
pub enum RevisionsResult { Ok(Vec<Revision>), Err(AppError) }
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Document {
  pub id: DocumentId,
  pub title: String,
  pub revisions: Vec<RevisionId>,
  pub created_at: u64,
  pub created_by: UserId,
  pub current_version: u8,
  pub project: ProjectId,
}
#[derive(CandidType, Deserialize)]
pub enum DocumentResult { Ok(Document), Err(AppError) }
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
pub enum OrganisationResult { Ok(Organisation), Err(AppError) }
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
pub enum ProjectResult { Ok(Project), Err(AppError) }
#[derive(CandidType, Deserialize)]
pub enum RevisionResult { Ok(Revision), Err(AppError) }
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct User {
  pub id: UserId,
  pub first_name: String,
  pub last_name: String,
  pub organisations: Vec<OrganisationId>,
}
#[derive(CandidType, Deserialize)]
pub enum UserResult { Ok(User), Err(AppError) }
#[derive(CandidType, Deserialize)]
pub enum DocumentsResult { Ok(Vec<Document>), Err(AppError) }
pub type PageSize = u64;
pub type PageNumber = u64;
#[derive(CandidType, Deserialize)]
pub struct PaginationInput {
  pub page_size: PageSize,
  pub page_number: PageNumber,
}
pub type TotalPages = u64;
pub type TotalItems = u64;
#[derive(CandidType, Deserialize)]
pub struct PaginationMetadata {
  pub page_size: PageSize,
  pub total_pages: TotalPages,
  pub total_items: TotalItems,
  pub has_previous_page: bool,
  pub has_next_page: bool,
  pub page_number: PageNumber,
}
#[derive(CandidType, Deserialize)]
pub enum PaginatedDocumentsResult {
  Ok(Vec<Document>,PaginationMetadata,),
  Err(AppError),
}
#[derive(CandidType, Deserialize)]
pub enum PaginatedOrganisationsResult {
  Ok(Vec<Organisation>,PaginationMetadata,),
  Err(AppError),
}
#[derive(CandidType, Deserialize)]
pub enum PaginatedProjectsResult {
  Ok(Vec<Project>,PaginationMetadata,),
  Err(AppError),
}
#[derive(CandidType, Deserialize)]
pub enum PaginatedRevisionsResult {
  Ok(Vec<Revision>,PaginationMetadata,),
  Err(AppError),
}
#[derive(CandidType, Deserialize)]
pub enum PaginatedUsersResult {
  Ok(Vec<User>,PaginationMetadata,),
  Err(AppError),
}

pub struct Service(pub Principal);
impl Service {
  pub async fn create_document(&self, arg0: ProjectId, arg1: String, arg2: serde_bytes::ByteBuf) -> Result<(DocumentIdResult,)> {
    ic_cdk::call(self.0, "create_document", (arg0,arg1,arg2,)).await
  }
  pub async fn create_organisation(&self, arg0: String) -> Result<(OrganisationIdResult,)> {
    ic_cdk::call(self.0, "create_organisation", (arg0,)).await
  }
  pub async fn create_project(&self, arg0: OrganisationId, arg1: String) -> Result<(ProjectIdResult,)> {
    ic_cdk::call(self.0, "create_project", (arg0,arg1,)).await
  }
  pub async fn create_revision(&self, arg0: ProjectId, arg1: DocumentId, arg2: serde_bytes::ByteBuf) -> Result<(RevisionIdResult,)> {
    ic_cdk::call(self.0, "create_revision", (arg0,arg1,arg2,)).await
  }
  pub async fn create_user(&self, arg0: String, arg1: String) -> Result<(UserIdResult,)> {
    ic_cdk::call(self.0, "create_user", (arg0,arg1,)).await
  }
  pub async fn diff_revisions(&self, arg0: RevisionId, arg1: RevisionId) -> Result<(RevisionsResult,)> {
    ic_cdk::call(self.0, "diff_revisions", (arg0,arg1,)).await
  }
  pub async fn get_document(&self, arg0: DocumentId) -> Result<(DocumentResult,)> {
    ic_cdk::call(self.0, "get_document", (arg0,)).await
  }
  pub async fn get_organisation(&self, arg0: OrganisationId) -> Result<(OrganisationResult,)> {
    ic_cdk::call(self.0, "get_organisation", (arg0,)).await
  }
  pub async fn get_project(&self, arg0: ProjectId) -> Result<(ProjectResult,)> {
    ic_cdk::call(self.0, "get_project", (arg0,)).await
  }
  pub async fn get_revision(&self, arg0: RevisionId) -> Result<(RevisionResult,)> {
    ic_cdk::call(self.0, "get_revision", (arg0,)).await
  }
  pub async fn get_user(&self) -> Result<(UserResult,)> {
    ic_cdk::call(self.0, "get_user", ()).await
  }
  pub async fn list_all_documents(&self) -> Result<(DocumentsResult,)> {
    ic_cdk::call(self.0, "list_all_documents", ()).await
  }
  pub async fn list_documents(&self, arg0: PaginationInput) -> Result<(PaginatedDocumentsResult,)> {
    ic_cdk::call(self.0, "list_documents", (arg0,)).await
  }
  pub async fn list_documents_by_project_id(&self, arg0: ProjectId, arg1: PaginationInput) -> Result<(PaginatedDocumentsResult,)> {
    ic_cdk::call(self.0, "list_documents_by_project_id", (arg0,arg1,)).await
  }
  pub async fn list_organisations(&self, arg0: PaginationInput) -> Result<(PaginatedOrganisationsResult,)> {
    ic_cdk::call(self.0, "list_organisations", (arg0,)).await
  }
  pub async fn list_projects(&self, arg0: PaginationInput) -> Result<(PaginatedProjectsResult,)> {
    ic_cdk::call(self.0, "list_projects", (arg0,)).await
  }
  pub async fn list_projects_by_organisation_id(&self, arg0: OrganisationId, arg1: PaginationInput) -> Result<(PaginatedProjectsResult,)> {
    ic_cdk::call(self.0, "list_projects_by_organisation_id", (arg0,arg1,)).await
  }
  pub async fn list_revisions(&self, arg0: PaginationInput) -> Result<(PaginatedRevisionsResult,)> {
    ic_cdk::call(self.0, "list_revisions", (arg0,)).await
  }
  pub async fn list_revisions_by_document_id(&self, arg0: DocumentId, arg1: PaginationInput) -> Result<(PaginatedRevisionsResult,)> {
    ic_cdk::call(self.0, "list_revisions_by_document_id", (arg0,arg1,)).await
  }
  pub async fn list_users(&self, arg0: PaginationInput) -> Result<(PaginatedUsersResult,)> {
    ic_cdk::call(self.0, "list_users", (arg0,)).await
  }
}

