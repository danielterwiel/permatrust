// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports, non_snake_case)]
use candid::{self, CandidType, Deserialize, Principal};
use ic_cdk::api::call::CallResult as Result;

pub type ProjectId = u64;
pub type DocumentId = u64;
#[derive(CandidType, Deserialize, Clone)]
pub enum AppError {
  EntityNotFound(String),
  Unauthorized,
  InternalError(String),
}
#[derive(CandidType, Deserialize, Clone)]
pub enum DocumentIdResult { Ok(DocumentId), Err(AppError) }
#[derive(CandidType, Deserialize, Clone)]
pub enum ProjectIdResult { Ok(ProjectId), Err(AppError) }
pub type RevisionId = u64;
#[derive(CandidType, Deserialize, Clone)]
pub enum RevisionIdResult { Ok(RevisionId), Err(AppError) }
#[derive(CandidType, Deserialize, Clone)]
pub struct Revision {
  pub id: RevisionId,
  pub content: serde_bytes::ByteBuf,
  pub document_id: DocumentId,
  pub author: Principal,
  pub version: u8,
  pub timestamp: u64,
  pub project_id: ProjectId,
}
#[derive(CandidType, Deserialize, Clone)]
pub enum RevisionsResult { Ok(Vec<Revision>), Err(AppError) }
#[derive(CandidType, Deserialize, Clone)]
pub struct Document {
  pub id: DocumentId,
  pub title: String,
  pub revisions: Vec<RevisionId>,
  pub projects: Vec<ProjectId>,
  pub current_version: u8,
}
#[derive(CandidType, Deserialize, Clone)]
pub enum DocumentResult { Ok(Document), Err(AppError) }
#[derive(CandidType, Deserialize, Clone)]
pub struct Project {
  pub id: ProjectId,
  pub documents: Vec<DocumentId>,
  pub name: String,
  pub author: Principal,
  pub timestamp: u64,
}
#[derive(CandidType, Deserialize, Clone)]
pub enum ProjectResult { Ok(Project), Err(AppError) }
#[derive(CandidType, Deserialize, Clone)]
pub enum RevisionResult { Ok(Revision), Err(AppError) }
#[derive(CandidType, Deserialize, Clone)]
pub enum DocumentsResult { Ok(Vec<Document>), Err(AppError) }
#[derive(CandidType, Deserialize, Clone)]
pub enum ProjectsResult { Ok(Vec<Project>), Err(AppError) }

pub struct Service(pub Principal);
impl Service {
  pub async fn create_document(&self, arg0: ProjectId, arg1: String, arg2: serde_bytes::ByteBuf) -> Result<(DocumentIdResult,)> {
    ic_cdk::call(self.0, "create_document", (arg0,arg1,arg2,)).await
  }
  pub async fn create_project(&self, arg0: String) -> Result<(ProjectIdResult,)> {
    ic_cdk::call(self.0, "create_project", (arg0,)).await
  }
  pub async fn create_revision(&self, arg0: ProjectId, arg1: DocumentId, arg2: serde_bytes::ByteBuf) -> Result<(RevisionIdResult,)> {
    ic_cdk::call(self.0, "create_revision", (arg0,arg1,arg2,)).await
  }
  pub async fn diff_revisions(&self, arg0: RevisionId, arg1: RevisionId) -> Result<(RevisionsResult,)> {
    ic_cdk::call(self.0, "diff_revisions", (arg0,arg1,)).await
  }
  pub async fn get_document(&self, arg0: DocumentId) -> Result<(DocumentResult,)> {
    ic_cdk::call(self.0, "get_document", (arg0,)).await
  }
  pub async fn get_project(&self, arg0: ProjectId) -> Result<(ProjectResult,)> {
    ic_cdk::call(self.0, "get_project", (arg0,)).await
  }
  pub async fn get_revision(&self, arg0: RevisionId) -> Result<(RevisionResult,)> {
    ic_cdk::call(self.0, "get_revision", (arg0,)).await
  }
  pub async fn list_all_documents(&self) -> Result<(DocumentsResult,)> {
    ic_cdk::call(self.0, "list_all_documents", ()).await
  }
  pub async fn list_documents(&self, arg0: ProjectId) -> Result<(DocumentsResult,)> {
    ic_cdk::call(self.0, "list_documents", (arg0,)).await
  }
  pub async fn list_projects(&self) -> Result<(ProjectsResult,)> {
    ic_cdk::call(self.0, "list_projects", ()).await
  }
  pub async fn list_revisions(&self, arg0: ProjectId, arg1: DocumentId) -> Result<(RevisionsResult,)> {
    ic_cdk::call(self.0, "list_revisions", (arg0,arg1,)).await
  }
}

