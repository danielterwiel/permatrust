use ic_cdk_macros::{init, query, update};
use shared::pt_backend_generated::{
    Document, DocumentId, DocumentRevision, DocumentRevisionId, ProjectId,
};
use std::cell::RefCell;
use std::collections::HashMap;

thread_local! {
    static DOCUMENTS: RefCell<HashMap<DocumentId, Document>> = RefCell::new(HashMap::new());
    static DOCUMENT_REVISIONS: RefCell<HashMap<DocumentRevisionId, DocumentRevision>> = RefCell::new(HashMap::new());
    static NEXT_DOCUMENT_ID: RefCell<DocumentId> = RefCell::new(0);
}

#[init]
fn init() {
    // Initialization logic, if needed
}

#[update]
fn create_document(
    project_id: ProjectId,
    title: String,
    content: serde_bytes::ByteBuf,
) -> DocumentId {
    let caller = ic_cdk::caller();
    let document_id = NEXT_DOCUMENT_ID.with(|next_id| {
        let current_id = *next_id.borrow();
        *next_id.borrow_mut() += 1;
        current_id
    });

    let initial_revision = DocumentRevision {
        id: 0, // First revision always has id 0
        documentId: document_id,
        version: 1,
        title,
        content,
        timestamp: ic_cdk::api::time(),
        author: caller,
    };

    DOCUMENT_REVISIONS.with(|document_revisions| {
        document_revisions
            .borrow_mut()
            .insert(initial_revision.id, initial_revision.clone());
    });

    let document = Document {
        id: document_id,
        currentVersion: 1,
        revisions: vec![initial_revision.id],
        projects: vec![project_id],
    };

    DOCUMENTS.with(|documents| {
        documents.borrow_mut().insert(document_id, document);
    });

    document_id
}

#[query]
fn list_all_documents() -> Vec<Document> {
    DOCUMENTS.with(|documents| documents.borrow().values().cloned().collect())
}

#[query]
fn list_documents(project_id: ProjectId) -> Vec<Document> {
    DOCUMENTS.with(|documents| {
        documents
            .borrow()
            .values()
            .filter(|doc| doc.projects.contains(&project_id))
            .cloned()
            .collect()
    })
}

#[query]
fn list_document_revisions(document_id: DocumentId) -> Vec<DocumentRevision> {
    DOCUMENTS.with(|documents| {
        documents
            .borrow()
            .get(&document_id)
            .map(|doc| {
                doc.revisions
                    .iter()
                    .filter_map(|rev_id| {
                        DOCUMENT_REVISIONS.with(|revisions| revisions.borrow().get(rev_id).cloned())
                    })
                    .collect()
            })
            .unwrap_or_else(Vec::new)
    })
}

ic_cdk::export_candid!();
