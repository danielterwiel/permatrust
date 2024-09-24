// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports, non_snake_case)]
use candid::{self, CandidType, Deserialize, Principal};
use ic_cdk::api::call::CallResult as Result;

pub type DocumentId = u64;
pub type ProjectId = u64;
#[derive(CandidType, Deserialize, Clone)]
pub struct Document {
  pub id: DocumentId,
  pub title: String,
  pub content: serde_bytes::ByteBuf,
  pub author: Principal,
  pub version: u32,
  pub timestamp: u64,
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
  pub async fn create_document(&self, arg0: String, arg1: serde_bytes::ByteBuf) -> Result<(DocumentId,)> {
    ic_cdk::call(self.0, "create_document", (arg0,arg1,)).await
  }
  pub async fn create_project(&self, arg0: String) -> Result<(ProjectId,)> {
    ic_cdk::call(self.0, "create_project", (arg0,)).await
  }
  pub async fn list_documents(&self) -> Result<(Vec<Document>,)> {
    ic_cdk::call(self.0, "list_documents", ()).await
  }
  pub async fn list_projects(&self) -> Result<(Vec<Project>,)> {
    ic_cdk::call(self.0, "list_projects", ()).await
  }
}

