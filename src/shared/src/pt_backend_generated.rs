// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports, non_snake_case)]
use candid::{self, CandidType, Deserialize, Principal};
use ic_cdk::api::call::CallResult as Result;

pub type DocumentId = u64;
#[derive(CandidType, Deserialize)]
pub enum DeleteDocumentRet { Ok, Err(String) }
#[derive(CandidType, Deserialize)]
pub struct Document {
  pub id: DocumentId,
  pub title: String,
  pub content: serde_bytes::ByteBuf,
  pub author: Principal,
  pub version: u32,
  pub timestamp: u64,
}
#[derive(CandidType, Deserialize)]
pub enum UpdateDocumentRet { Ok, Err(String) }

pub struct Service(pub Principal);
impl Service {
  pub async fn create_document(&self, arg0: String, arg1: serde_bytes::ByteBuf) -> Result<(DocumentId,)> {
    ic_cdk::call(self.0, "create_document", (arg0,arg1,)).await
  }
  pub async fn delete_document(&self, arg0: DocumentId) -> Result<(DeleteDocumentRet,)> {
    ic_cdk::call(self.0, "delete_document", (arg0,)).await
  }
  pub async fn get_document(&self, arg0: DocumentId) -> Result<(Option<Document>,)> {
    ic_cdk::call(self.0, "get_document", (arg0,)).await
  }
  pub async fn list_documents(&self) -> Result<(Vec<Document>,)> {
    ic_cdk::call(self.0, "list_documents", ()).await
  }
  pub async fn update_document(&self, arg0: DocumentId, arg1: Option<String>, arg2: Option<serde_bytes::ByteBuf>) -> Result<(UpdateDocumentRet,)> {
    ic_cdk::call(self.0, "update_document", (arg0,arg1,arg2,)).await
  }
}

