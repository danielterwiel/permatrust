// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports, non_snake_case)]
use candid::{self, CandidType, Deserialize, Principal};
use ic_cdk::api::call::CallResult as Result;

pub type ProjectId = u64;
pub type DocumentId = u64;
pub type DocumentRevisionId = u64;
#[derive(CandidType, Deserialize, Clone)]
pub struct DocumentRevision {
  pub id: DocumentRevisionId,
  pub title: String,
  pub content: serde_bytes::ByteBuf,
  pub author: Principal,
  pub version: u64,
  pub timestamp: u64,
  pub documentId: DocumentId,
}
#[derive(CandidType, Deserialize, Clone)]
pub struct Document {
  pub id: DocumentId,
  pub revisions: Vec<DocumentRevisionId>,
  pub projects: Vec<ProjectId>,
  pub currentVersion: u64,
}
#[derive(CandidType, Deserialize, Clone)]
pub struct Project {
  pub id: ProjectId,
  pub documents: Vec<DocumentId>,
  pub name: String,
  pub author: Principal,
  pub timestamp: u64,
}

pub struct Service(pub Principal);
impl Service {
  pub async fn create_document(&self, arg0: ProjectId, arg1: String, arg2: serde_bytes::ByteBuf) -> Result<(DocumentId,)> {
    ic_cdk::call(self.0, "create_document", (arg0,arg1,arg2,)).await
  }
  pub async fn create_document_revision(&self, arg0: ProjectId, arg1: DocumentId, arg2: String, arg3: serde_bytes::ByteBuf) -> Result<(DocumentRevisionId,)> {
    ic_cdk::call(self.0, "create_document_revision", (arg0,arg1,arg2,arg3,)).await
  }
  pub async fn create_project(&self, arg0: String) -> Result<(ProjectId,)> {
    ic_cdk::call(self.0, "create_project", (arg0,)).await
  }
  pub async fn diff_document_revisions(&self, arg0: DocumentRevisionId, arg1: DocumentRevisionId) -> Result<(Vec<DocumentRevision>,)> {
    ic_cdk::call(self.0, "diff_document_revisions", (arg0,arg1,)).await
  }
  pub async fn list_all_documents(&self) -> Result<(Vec<Document>,)> {
    ic_cdk::call(self.0, "list_all_documents", ()).await
  }
  pub async fn list_document_revisions(&self, arg0: DocumentId) -> Result<(Vec<DocumentRevision>,)> {
    ic_cdk::call(self.0, "list_document_revisions", (arg0,)).await
  }
  pub async fn list_documents(&self, arg0: ProjectId) -> Result<(Vec<Document>,)> {
    ic_cdk::call(self.0, "list_documents", (arg0,)).await
  }
  pub async fn list_projects(&self) -> Result<(Vec<Project>,)> {
    ic_cdk::call(self.0, "list_projects", ()).await
  }
}

