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

// TODO: filter on author
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

#[query]
fn diff_document_revisions(
    start_revision_id: DocumentRevisionId,
    end_revision_id: DocumentRevisionId,
) -> Vec<DocumentRevision> {
    DOCUMENT_REVISIONS.with(|revisions| {
        let revisions = revisions.borrow();
        let start_revision = revisions.get(&start_revision_id);
        let end_revision = revisions.get(&end_revision_id);

        match (start_revision, end_revision) {
            (Some(start), Some(end)) => {
                if start.documentId != end.documentId {
                    return Vec::new(); // Revisions are from different documents
                }

                let document_id = start.documentId;
                DOCUMENTS.with(|documents| {
                    if let Some(document) = documents.borrow().get(&document_id) {
                        let start_index = document
                            .revisions
                            .iter()
                            .position(|&id| id == start_revision_id)
                            .unwrap_or(0);
                        let end_index = document
                            .revisions
                            .iter()
                            .position(|&id| id == end_revision_id)
                            .unwrap_or(document.revisions.len() - 1);

                        if start_index <= end_index {
                            document.revisions[start_index..=end_index]
                                .iter()
                                .filter_map(|&rev_id| revisions.get(&rev_id).cloned())
                                .collect()
                        } else {
                            document.revisions[end_index..=start_index]
                                .iter()
                                .rev()
                                .filter_map(|&rev_id| revisions.get(&rev_id).cloned())
                                .collect()
                        }
                    } else {
                        Vec::new()
                    }
                })
            }
            (Some(revision), None) | (None, Some(revision)) => {
                vec![revision.clone()]
            }
            (None, None) => Vec::new(),
        }
    })
}

#[update]
fn create_document_revision(
    project_id: ProjectId,
    document_id: DocumentId,
    title: String,
    content: serde_bytes::ByteBuf,
) -> DocumentRevisionId {
    let caller = ic_cdk::caller();

    DOCUMENTS.with(|documents| {
        let mut documents = documents.borrow_mut();
        let document = documents.get_mut(&document_id).expect("Document not found");

        let new_revision_id = document.revisions.len() as DocumentRevisionId;
        let new_version = document.currentVersion + 1;

        let new_revision = DocumentRevision {
            id: new_revision_id,
            documentId: document_id,
            version: new_version,
            title,
            content,
            timestamp: ic_cdk::api::time(),
            author: caller,
        };

        DOCUMENT_REVISIONS.with(|document_revisions| {
            document_revisions
                .borrow_mut()
                .insert(new_revision_id, new_revision.clone());
        });

        document.currentVersion = new_version;
        document.revisions.push(new_revision_id);

        if !document.projects.contains(&project_id) {
            document.projects.push(project_id);
        }

        new_revision_id
    })
}

ic_cdk::export_candid!();
