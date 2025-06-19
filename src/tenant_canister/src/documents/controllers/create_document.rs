use crate::documents::document_manager::DocumentManager;
use shared::types::documents::{CreateDocumentInput, CreateDocumentResult};

#[ic_cdk_macros::update]
pub fn create_document(input: CreateDocumentInput) -> CreateDocumentResult {
    DocumentManager::create_document(input)
}
