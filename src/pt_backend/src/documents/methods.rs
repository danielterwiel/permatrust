use super::state;
use super::*;
use crate::logger::{log_info, loggable_document};
use crate::revisions::create_revision;
use crate::users::get_user_by_principal;
use shared::utils::pagination::paginate;

#[ic_cdk_macros::update]
pub fn create_document(
    project_id: ProjectId,
    title: String,
    content: serde_bytes::ByteBuf,
) -> Result<DocumentId, AppError> {
    let document_id = state::get_next_id();
    let principal = ic_cdk::caller();
    let user = get_user_by_principal(principal)?;

    let document = Document {
        id: document_id,
        title,
        version: 0,
        revisions: Vec::new(),
        created_by: user.id,
        created_at: ic_cdk::api::time(),
        project: project_id,
    };

    state::insert(document_id, document.clone());

    match create_revision(project_id, document_id, content) {
        Ok(_revision_id) => {
            log_info("create_document", loggable_document(&document));
            Ok(document_id)
        }
        Err(err) => {
            state::remove(document_id);
            Err(err)
        }
    }
}

#[ic_cdk_macros::query]
pub fn list_documents(
    pagination: PaginationInput,
) -> Result<(Vec<Document>, PaginationMetadata), AppError> {
    let documents = state::get_all();
    paginate(
        &documents,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[ic_cdk_macros::query]
pub fn list_documents_by_project_id(
    project_id: ProjectId,
    pagination: PaginationInput,
) -> Result<(Vec<Document>, PaginationMetadata), AppError> {
    let documents = state::get_by_project(project_id);
    paginate(
        &documents,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[ic_cdk_macros::query]
pub fn get_document(document_id: DocumentId) -> Result<Document, AppError> {
    state::get_by_id(document_id).ok_or(AppError::EntityNotFound("Document not found".to_string()))
}
