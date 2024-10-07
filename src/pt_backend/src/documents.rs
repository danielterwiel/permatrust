use crate::logger::{log_info, loggable_document};
use ic_cdk_macros::{query, update};
use shared::pagination::{paginate, PaginatedDocumentsResult};
use shared::pt_backend_generated::{
    AppError, Document, DocumentId, DocumentIdResult, DocumentResult, PaginationInput, ProjectId,
    RevisionId, RevisionIdResult,
};
use std::cell::RefCell;
use std::collections::HashMap;

use crate::revisions::create_revision;

thread_local! {
    pub static DOCUMENTS: RefCell<HashMap<DocumentId, Document>> = RefCell::new(HashMap::new());
}

pub fn get_next_document_id() -> u64 {
    DOCUMENTS.with(|documents| documents.borrow().len() as u64)
}

fn get_documents_by_project(project_id: ProjectId) -> Vec<Document> {
    DOCUMENTS.with(|documents| {
        documents
            .borrow()
            .values()
            .filter(|doc| doc.project == project_id)
            .cloned()
            .collect()
    })
}

pub fn insert_document(document: Document) {
    DOCUMENTS.with(|documents| {
        documents.borrow_mut().insert(document.id, document);
    });
}

pub fn update_document_revision(document_id: DocumentId, version: u8, revision_id: RevisionId) {
    DOCUMENTS.with(|documents| {
        if let Some(document) = documents.borrow_mut().get_mut(&document_id) {
            document.current_version = version;
            document.revisions.push(revision_id);
        }
    });
}

pub fn get_document_by_id(document_id: DocumentId) -> Option<Document> {
    DOCUMENTS.with(|documents| documents.borrow().get(&document_id).cloned())
}

#[update]
fn create_document(
    project_id: ProjectId,
    title: String,
    content: serde_bytes::ByteBuf,
) -> DocumentIdResult {
    let document_id = get_next_document_id();

    let document = Document {
        id: document_id,
        title,
        current_version: 0,
        revisions: Vec::new(),
        created_by: ic_cdk::caller(),
        created_at: ic_cdk::api::time(),
        project: project_id,
    };

    insert_document(document.clone());

    let revision_result = create_revision(project_id, document_id, content);

    match revision_result {
        RevisionIdResult::Ok(_revision_id) => {
            log_info("create_document", loggable_document(&document));
            DocumentIdResult::Ok(document_id.into())
        }
        RevisionIdResult::Err(err) => {
            // Remove the inserted document if revision creation failed
            DOCUMENTS.with(|documents| {
                documents.borrow_mut().remove(&document_id);
            });
            DocumentIdResult::Err(err)
        }
    }
}

#[query]
fn list_documents(project_id: ProjectId, pagination: PaginationInput) -> PaginatedDocumentsResult {
    let documents = get_documents_by_project(project_id);

    match paginate(&documents, pagination.page_size, pagination.page_number) {
        Ok((paginated_documents, pagination_metadata)) => {
            PaginatedDocumentsResult::Ok(paginated_documents, pagination_metadata)
        }
        Err(e) => PaginatedDocumentsResult::Err(e),
    }
}

#[query]
fn get_document(document_id: DocumentId) -> DocumentResult {
    match get_document_by_id(document_id) {
        Some(document) => DocumentResult::Ok(document),
        None => DocumentResult::Err(AppError::EntityNotFound("Document not found".to_string())),
    }
}
