use super::*;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU64, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static DOCUMENTS: RefCell<StableBTreeMap<DocumentId, Document, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(3))),
        )
    );

    static NEXT_ID: AtomicU64 = const { AtomicU64::new(0) };
}

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
