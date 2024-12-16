use crate::logger::{log_info, loggable_document};
use ic_cdk_macros::{query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use std::cell::RefCell;
use std::sync::atomic::{AtomicU64, Ordering};

use shared::types::documents::{Document, DocumentId};
use shared::types::errors::AppError;
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::projects::ProjectId;
use shared::types::revisions::RevisionId;

use shared::utils::pagination::paginate;

use crate::revisions::create_revision;
use crate::users::get_user_by_principal;

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static DOCUMENTS: RefCell<StableBTreeMap<DocumentId, Document, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))),
        )
    );

    static NEXT_ID: AtomicU64 = AtomicU64::new(0);
}

pub mod document_utils {
    use super::*;

    pub fn get_next_id() -> DocumentId {
        NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
    }

    pub fn get_all() -> Vec<Document> {
        DOCUMENTS.with(|documents| {
            documents
                .borrow()
                .iter()
                .map(|(_, doc)| doc.clone())
                .collect()
        })
    }

    pub fn get_by_project(project_id: ProjectId) -> Vec<Document> {
        DOCUMENTS.with(|documents| {
            documents
                .borrow()
                .iter()
                .filter(|(_, doc)| doc.project == project_id)
                .map(|(_, doc)| doc.clone())
                .collect()
        })
    }

    pub fn insert(document_id: DocumentId, document: Document) {
        DOCUMENTS.with(|documents| {
            documents.borrow_mut().insert(document_id, document);
        });
    }

    pub fn remove(document_id: DocumentId) {
        DOCUMENTS.with(|documents| {
            documents.borrow_mut().remove(&document_id);
        });
    }

    pub fn update_revision(document_id: DocumentId, version: u8, revision_id: RevisionId) {
        DOCUMENTS.with(|documents| {
            let mut documents_ref = documents.borrow_mut();
            if let Some(mut document) = documents_ref.get(&document_id) {
                document.version = version;
                document.revisions.push(revision_id);
                documents_ref.insert(document_id, document);
            }
        });
    }

    pub fn get_by_id(document_id: DocumentId) -> Option<Document> {
        DOCUMENTS.with(|documents| documents.borrow().get(&document_id))
    }
}

#[update]
fn create_document(
    project_id: ProjectId,
    title: String,
    content: serde_bytes::ByteBuf,
) -> Result<DocumentId, AppError> {
    let document_id = document_utils::get_next_id();
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

    document_utils::insert(document_id, document.clone());

    match create_revision(project_id, document_id, content) {
        Ok(_revision_id) => {
            log_info("create_document", loggable_document(&document));
            Ok(document_id.into())
        }
        Err(err) => {
            document_utils::remove(document_id);
            Err(err)
        }
    }
}

#[query]
fn list_documents(
    pagination: PaginationInput,
) -> Result<(Vec<Document>, PaginationMetadata), AppError> {
    let documents = document_utils::get_all();
    paginate(
        &documents,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[query]
fn list_documents_by_project_id(
    project_id: ProjectId,
    pagination: PaginationInput,
) -> Result<(Vec<Document>, PaginationMetadata), AppError> {
    let documents = document_utils::get_by_project(project_id);
    paginate(
        &documents,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[query]
fn get_document(document_id: DocumentId) -> Result<Document, AppError> {
    document_utils::get_by_id(document_id)
        .ok_or(AppError::EntityNotFound("Document not found".to_string()))
}
