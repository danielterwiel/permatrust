use ic_cdk_macros::{init, query, update};
use shared::pt_backend_generated::{
    Document, DocumentId, DocumentRevision, DocumentRevisionId, ProjectId,
};
use std::cell::RefCell;
use std::collections::HashMap;

thread_local! {
    static DOCUMENTS: RefCell<HashMap<DocumentId, Document>> = RefCell::new(HashMap::new());
    static DOCUMENT_REVISIONS: RefCell<HashMap<DocumentRevisionId, DocumentRevision>> = RefCell::new(HashMap::new());
}

#[init]
fn init() {
    // Initialization logic, if needed
}

fn get_next_document_id(project_id: ProjectId) -> DocumentId {
    DOCUMENTS.with(|documents| {
        let documents = documents.borrow();
        documents
            .iter()
            .filter(|(_, doc)| doc.projects.contains(&project_id))
            .map(|(id, _)| *id)
            .max()
            .map_or(0, |max_id| max_id + 1)
    })
}

fn insert_document(document: Document) {
    DOCUMENTS.with(|documents| {
        documents.borrow_mut().insert(document.id, document);
    });
}

fn update_document_revisions(
    project_id: ProjectId,
    document_id: DocumentId,
    revision_id: DocumentRevisionId,
) {
    DOCUMENTS.with(|documents| {
        let mut documents = documents.borrow_mut();
        if let Some(doc) = documents.get_mut(&document_id) {
            if doc.projects.contains(&project_id) {
                doc.revisions.push(revision_id);
            }
        }
    });
}

#[update]
fn create_document(
    project_id: ProjectId,
    title: String,
    content: serde_bytes::ByteBuf,
) -> DocumentId {
    let document_id = get_next_document_id(project_id);
    ic_cdk::println!("document_id: {}", document_id);

    let document = Document {
        id: document_id,
        title,
        current_version: 0,
        revisions: Vec::new(),
        projects: vec![project_id],
    };

    insert_document(document);

    let revision_id = create_document_revision(project_id, document_id, content);
    update_document_revisions(project_id, document_id, revision_id);

    document_id
}

fn get_all_documents() -> Vec<Document> {
    DOCUMENTS.with(|documents| documents.borrow().values().cloned().collect())
}

fn get_documents_by_project(project_id: ProjectId) -> Vec<Document> {
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
fn list_all_documents() -> Vec<Document> {
    get_all_documents()
}

#[query]
fn list_documents(project_id: ProjectId) -> Vec<Document> {
    get_documents_by_project(project_id)
}

fn get_document_revisions(project_id: ProjectId, document_id: DocumentId) -> Vec<DocumentRevision> {
    DOCUMENT_REVISIONS.with(|documents| {
        documents
            .borrow()
            .values()
            .filter(|rev| rev.project_id == project_id && rev.document_id == document_id)
            .cloned()
            .collect()
    })
}

#[query]
fn list_document_revisions(
    project_id: ProjectId,
    document_id: DocumentId,
) -> Vec<DocumentRevision> {
    get_document_revisions(project_id, document_id)
}

fn get_revision(revision_id: DocumentRevisionId) -> Option<DocumentRevision> {
    DOCUMENT_REVISIONS.with(|revisions| revisions.borrow().get(&revision_id).cloned())
}

fn get_document_revision_range(
    document: &Document,
    start_index: usize,
    end_index: usize,
) -> Vec<DocumentRevision> {
    DOCUMENT_REVISIONS.with(|revisions| {
        let revisions = revisions.borrow();
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
    })
}

#[query]
fn diff_document_revisions(
    start_revision_id: DocumentRevisionId,
    end_revision_id: DocumentRevisionId,
) -> Vec<DocumentRevision> {
    let start_revision = get_revision(start_revision_id);
    let end_revision = get_revision(end_revision_id);

    match (start_revision, end_revision) {
        (Some(start), Some(end)) => {
            if start.document_id != end.document_id {
                return Vec::new(); // Revisions are from different documents
            }

            let document_id = start.document_id;
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

                    get_document_revision_range(document, start_index, end_index)
                } else {
                    Vec::new()
                }
            })
        }
        (Some(revision), None) | (None, Some(revision)) => vec![revision],
        (None, None) => Vec::new(),
    }
}

fn get_next_revision_id() -> u64 {
    DOCUMENT_REVISIONS.with(|revisions| {
        let revisions = revisions.borrow();
        return revisions.len() as u64 + 1;
    })
}

// fn get_next_revision_version(project_id: ProjectId, document_id: DocumentId) -> usize {
//     DOCUMENT_REVISIONS.with(|revisions| {
//         let revisions = revisions.borrow();
//         revisions
//             .values()
//             .find(|rev| rev.project_id == project_id && rev.document_id == document_id)
//             .map_or(0, |_| revisions.len())
//     })
// }

fn insert_document_revision(revision_id: DocumentRevisionId, revision: DocumentRevision) {
    DOCUMENT_REVISIONS.with(|document_revisions| {
        document_revisions
            .borrow_mut()
            .insert(revision_id, revision);
    });
}

#[update]
fn create_document_revision(
    project_id: ProjectId,
    document_id: DocumentId,
    content: serde_bytes::ByteBuf,
) -> DocumentRevisionId {
    let caller = ic_cdk::caller();

    DOCUMENTS.with(|documents| {
        let mut documents = documents.borrow_mut();

        let document = documents
            .values_mut()
            .find(|doc| doc.projects.contains(&project_id) && doc.id == document_id)
            .expect("Document not found or does not belong to the specified project 2.0");

        let new_revision_id = get_next_revision_id();
        let version = document.current_version + 1;

        let new_revision = DocumentRevision {
            id: new_revision_id,
            version,
            document_id,
            project_id,
            content,
            timestamp: ic_cdk::api::time(),
            author: caller,
        };

        insert_document_revision(new_revision_id, new_revision);

        document.current_version = version;
        document.revisions.push(new_revision_id);

        new_revision_id
    })
}

ic_cdk::export_candid!();
