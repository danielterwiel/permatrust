use ic_cdk_macros::{init, query, update};
use shared::pt_backend_generated::{
    AppError, Document, DocumentId, DocumentIdResult, DocumentResult, DocumentsResult, ProjectId,
    Revision, RevisionId, RevisionIdResult, RevisionResult, RevisionsResult,
};
use std::cell::RefCell;
use std::collections::HashMap;

thread_local! {
    static DOCUMENTS: RefCell<HashMap<DocumentId, Document>> = RefCell::new(HashMap::new());
    static REVISIONS: RefCell<HashMap<RevisionId, Revision>> = RefCell::new(HashMap::new());
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

fn update_revisions(project_id: ProjectId, document_id: DocumentId, revision_id: RevisionId) {
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
) -> DocumentIdResult {
    let document_id = get_next_document_id(project_id);

    let document = Document {
        id: document_id,
        title,
        current_version: 0,
        revisions: Vec::new(),
        projects: vec![project_id],
    };

    insert_document(document);

    let revision_result = create_revision(project_id, document_id, content);

    match revision_result {
        RevisionIdResult::Ok(revision_id) => {
            update_revisions(project_id, document_id, revision_id);
            DocumentIdResult::Ok(document_id)
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
fn list_documents(project_id: ProjectId) -> DocumentsResult {
    let documents = get_documents_by_project(project_id);
    DocumentsResult::Ok(documents)
}

#[query]
fn get_document(document_id: DocumentId) -> DocumentResult {
    DOCUMENTS.with(|documents| match documents.borrow().get(&document_id) {
        Some(document) => DocumentResult::Ok(document.clone()),
        None => DocumentResult::Err(AppError::EntityNotFound("Document not found".to_string())),
    })
}

fn get_revisions(
    project_id: ProjectId,
    document_id: DocumentId,
) -> Result<Vec<Revision>, AppError> {
    // Check if the document exists and belongs to the project
    let document_exists = DOCUMENTS.with(|documents| {
        documents
            .borrow()
            .values()
            .any(|doc| doc.id == document_id && doc.projects.contains(&project_id))
    });

    if !document_exists {
        return Err(AppError::EntityNotFound(
            "Document not found or does not belong to the specified project".to_string(),
        ));
    }

    let revisions = REVISIONS.with(|documents| {
        documents
            .borrow()
            .values()
            .filter(|rev| rev.project_id == project_id && rev.document_id == document_id)
            .cloned()
            .collect()
    });

    Ok(revisions)
}

#[query]
fn list_revisions(project_id: ProjectId, document_id: DocumentId) -> RevisionsResult {
    match get_revisions(project_id, document_id) {
        Ok(revisions) => RevisionsResult::Ok(revisions),
        Err(err) => RevisionsResult::Err(err),
    }
}

#[query]
fn get_revision(revision_id: RevisionId) -> RevisionResult {
    REVISIONS.with(|revisions| match revisions.borrow().get(&revision_id) {
        Some(revision) => RevisionResult::Ok(revision.clone()),
        None => RevisionResult::Err(AppError::EntityNotFound("Revision not found".to_string())),
    })
}

fn get_revision_range(document: &Document, start_index: usize, end_index: usize) -> Vec<Revision> {
    REVISIONS.with(|revisions| {
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
fn diff_revisions(start_revision_id: RevisionId, end_revision_id: RevisionId) -> RevisionsResult {
    let start_revision_result = get_revision(start_revision_id);
    let end_revision_result = get_revision(end_revision_id);

    match (start_revision_result, end_revision_result) {
        (RevisionResult::Ok(start), RevisionResult::Ok(end)) => {
            if start.document_id != end.document_id {
                // Revisions are from different documents
                RevisionsResult::Err(AppError::InternalError(
                    "Revisions are from different documents".to_string(),
                ))
            } else {
                let document_id = start.document_id;
                DOCUMENTS.with(|documents| {
                    if let Some(document) = documents.borrow().get(&document_id) {
                        let start_index_option = document
                            .revisions
                            .iter()
                            .position(|&id| id == start_revision_id);
                        let end_index_option = document
                            .revisions
                            .iter()
                            .position(|&id| id == end_revision_id);

                        if let (Some(start_index), Some(end_index)) =
                            (start_index_option, end_index_option)
                        {
                            let revisions = get_revision_range(document, start_index, end_index);
                            RevisionsResult::Ok(revisions)
                        } else {
                            RevisionsResult::Err(AppError::EntityNotFound(
                                "Revisions not found in document".to_string(),
                            ))
                        }
                    } else {
                        RevisionsResult::Err(AppError::EntityNotFound(
                            "Document not found".to_string(),
                        ))
                    }
                })
            }
        }
        (RevisionResult::Err(err), _) | (_, RevisionResult::Err(err)) => RevisionsResult::Err(err),
    }
}

fn get_next_revision_id() -> u64 {
    REVISIONS.with(|revisions| {
        let revisions = revisions.borrow();
        if revisions.is_empty() {
            0
        } else {
            revisions.len() as u64
        }
    })
}

fn insert_revision(revision_id: RevisionId, revision: Revision) {
    REVISIONS.with(|revisions| {
        revisions.borrow_mut().insert(revision_id, revision);
    });
}

#[update]
fn create_revision(
    project_id: ProjectId,
    document_id: DocumentId,
    content: serde_bytes::ByteBuf,
) -> RevisionIdResult {
    let caller = ic_cdk::caller();

    DOCUMENTS.with(|documents| {
        let mut documents = documents.borrow_mut();

        let document_option = documents
            .values_mut()
            .find(|doc| doc.projects.contains(&project_id) && doc.id == document_id);

        match document_option {
            Some(document) => {
                let new_revision_id = get_next_revision_id();
                let version = document.current_version + 1;

                let new_revision = Revision {
                    id: new_revision_id,
                    version,
                    document_id,
                    project_id,
                    content,
                    timestamp: ic_cdk::api::time(),
                    author: caller,
                };

                insert_revision(new_revision_id, new_revision);

                document.current_version = version;
                document.revisions.push(new_revision_id);

                RevisionIdResult::Ok(new_revision_id)
            }
            None => RevisionIdResult::Err(AppError::EntityNotFound(
                "Document not found or does not belong to the specified project".to_string(),
            )),
        }
    })
}

ic_cdk::export_candid!();
