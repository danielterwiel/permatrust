use super::state;
use super::*;
use crate::logger::{log_info, loggable_document};
use crate::revisions::create_revision;
use crate::users::state::get_by_principal;
use shared::types::documents::{
    CreateDocumentInput, CreateDocumentResult, ListDocumentsInput, ListDocumentsResult,
};
use shared::types::revisions::{CreateRevisionInput, CreateRevisionResult};
use shared::utils::pagination::paginate;

#[ic_cdk_macros::update]
pub fn create_document(input: CreateDocumentInput) -> CreateDocumentResult {
    let document_id = state::get_next_id();
    let principal = ic_cdk::api::msg_caller();
    let user = match get_by_principal(principal) {
        Some(u) => u,
        None => {
            return CreateDocumentResult::Err(AppError::EntityNotFound(
                "User not found".to_string(),
            ))
        }
    };

    let document = Document {
        id: document_id,
        title: input.title,
        version: 0,
        revisions: Vec::new(),
        created_by: user.id,
        created_at: ic_cdk::api::time(),
        project_id: input.project_id,
    };

    state::insert(document_id, document.clone());

    match create_revision(CreateRevisionInput {
        project_id: input.project_id,
        document_id,
        content: input.content,
    }) {
        CreateRevisionResult::Ok(_revision_id) => {
            log_info("create_document", loggable_document(&document));
            CreateDocumentResult::Ok(document_id)
        }
        CreateRevisionResult::Err(e) => {
            state::remove(document_id);
            CreateDocumentResult::Err(e)
        }
    }
}

#[ic_cdk_macros::query]
pub fn list_documents(input: ListDocumentsInput) -> ListDocumentsResult {
    let documents = state::get_all();
    ic_cdk::println!("Total documents: {}", documents.len());
    match paginate(
        &documents,
        input.pagination.page_size,
        input.pagination.page_number,
        input.pagination.filters,
        input.pagination.sort,
    ) {
        Ok(result) => {
            ic_cdk::println!("Filtered documents: {}", result.0.len());
            ListDocumentsResult::Ok(result)
        }
        Err(e) => ListDocumentsResult::Err(e),
    }
}
