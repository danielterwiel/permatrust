// This is an experimental feature to generate Rust binding from Candid.
// You may want to manually adjust some of the types.
#![allow(dead_code, unused_imports, non_snake_case)]
use candid::{self, CandidType, Deserialize, Principal};
use ic_cdk::api::call::CallResult as Result;

#[derive(CandidType, Deserialize)]
pub struct Document {
  pub id: String,
  pub content: String,
  pub owner: String,
  pub allowed_users: Vec<String>,
  pub version: u32,
  pub timestamp: u64,
}
pub type DocumentList = Vec<Document>;

pub struct Service(pub Principal);
impl Service {
  pub async fn add_user_to_document(&self, arg0: String, arg1: String, arg2: String) -> Result<()> {
    ic_cdk::call(self.0, "add_user_to_document", (arg0,arg1,arg2,)).await
  }
  pub async fn create_document(&self, arg0: String, arg1: String, arg2: String) -> Result<()> {
    ic_cdk::call(self.0, "create_document", (arg0,arg1,arg2,)).await
  }
  pub async fn get_document(&self, arg0: String, arg1: String) -> Result<(Option<Document>,)> {
    ic_cdk::call(self.0, "get_document", (arg0,arg1,)).await
  }
  pub async fn get_documents(&self, arg0: String, arg1: String) -> Result<(Option<DocumentList>,)> {
    ic_cdk::call(self.0, "get_documents", (arg0,arg1,)).await
  }
  pub async fn update_document(&self, arg0: String, arg1: String, arg2: String) -> Result<()> {
    ic_cdk::call(self.0, "update_document", (arg0,arg1,arg2,)).await
  }
}

