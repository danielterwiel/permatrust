use crate::documents::document_manager::DocumentManager;
use shared::types::documents::{ListDocumentsInput, ListDocumentsResult};

#[ic_cdk_macros::query]
pub fn list_documents(input: ListDocumentsInput) -> ListDocumentsResult {
    DocumentManager::list_documents(input)
}
