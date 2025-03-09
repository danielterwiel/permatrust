use super::state;
use super::*;
use crate::logger::{log_info, loggable_document};
use crate::revisions::create_revision;
use crate::users::state::get_by_principal;
use shared::types::documents::{
    CreateDocumentInput, CreateDocumentResult, DocumentIdInput, GetDocumentResult,
    ListDocumentsByProjectIdInput, ListDocumentsByProjectIdResult, ListDocumentsInput,
    ListDocumentsResult,
};
use shared::types::revisions::{CreateRevisionInput, CreateRevisionResult};
use shared::utils::pagination::paginate;

#[ic_cdk_macros::update]
pub fn create_document(input: CreateDocumentInput) -> CreateDocumentResult {
    let document_id = state::get_next_id();
    let principal = ic_cdk::caller();
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
    match paginate(
        &documents,
        input.pagination.page_size,
        input.pagination.page_number,
        input.pagination.filters,
        input.pagination.sort,
    ) {
        Ok(result) => ListDocumentsResult::Ok(result),
        Err(e) => ListDocumentsResult::Err(e),
    }
}

#[ic_cdk_macros::query]
pub fn list_documents_by_project_id(
    input: ListDocumentsByProjectIdInput,
) -> ListDocumentsByProjectIdResult {
    let documents = state::get_by_project(input.project_id);
    match paginate(
        &documents,
        input.pagination.page_size,
        input.pagination.page_number,
        input.pagination.filters,
        input.pagination.sort,
    ) {
        Ok(result) => ListDocumentsByProjectIdResult::Ok(result),
        Err(e) => ListDocumentsByProjectIdResult::Err(e),
    }
}

#[ic_cdk_macros::query]
pub fn get_document(input: DocumentIdInput) -> GetDocumentResult {
    match state::get_by_id(input.id) {
        Some(doc) => GetDocumentResult::Ok(doc),
        None => GetDocumentResult::Err(AppError::EntityNotFound("Document not found".to_string())),
    }
}
