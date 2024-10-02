use crate::logger::{log_info, loggable_revision};
use ic_cdk_macros::{query, update};
use shared::pagination::{paginate, PaginatedRevisionsResult};
use shared::pt_backend_generated::{
    AppError, DocumentId, PaginationInput, ProjectId, Revision, RevisionId, RevisionIdResult,
    RevisionResult, RevisionsResult,
};
use std::cell::RefCell;
use std::collections::HashMap;

use crate::documents::{get_document_by_id, update_document_revision};

thread_local! {
    pub static REVISIONS: RefCell<HashMap<RevisionId, Revision>> = RefCell::new(HashMap::new());
}

pub fn get_next_revision_id() -> u64 {
    REVISIONS.with(|revisions| revisions.borrow().len() as u64)
}

pub fn insert_revision(revision_id: RevisionId, revision: Revision) {
    REVISIONS.with(|revisions| {
        revisions.borrow_mut().insert(revision_id, revision);
    });
}

#[update]
pub fn create_revision(
    project_id: ProjectId,
    document_id: DocumentId,
    content: serde_bytes::ByteBuf,
) -> RevisionIdResult {
    let caller = ic_cdk::caller();

    match get_document_by_id(document_id) {
        Some(document) if document.projects.contains(&project_id) => {
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

            insert_revision(new_revision_id, new_revision.clone());
            update_document_revision(document_id, version, new_revision_id);
            log_info("create_revision", loggable_revision(&new_revision));

            RevisionIdResult::Ok(new_revision_id)
        }
        Some(_) => RevisionIdResult::Err(AppError::EntityNotFound(
            "Document does not belong to the specified project".to_string(),
        )),
        None => RevisionIdResult::Err(AppError::EntityNotFound("Document not found".to_string())),
    }
}

#[query]
pub fn get_revision(revision_id: RevisionId) -> RevisionResult {
    REVISIONS.with(|revisions| match revisions.borrow().get(&revision_id) {
        Some(revision) => RevisionResult::Ok(revision.clone()),
        None => RevisionResult::Err(AppError::EntityNotFound("Revision not found".to_string())),
    })
}

pub fn get_revisions(
    project_id: ProjectId,
    document_id: DocumentId,
) -> Result<Vec<Revision>, AppError> {
    if let Some(document) = get_document_by_id(document_id) {
        if document.projects.contains(&project_id) {
            let revisions = REVISIONS.with(|revisions| {
                revisions
                    .borrow()
                    .values()
                    .filter(|rev| rev.project_id == project_id && rev.document_id == document_id)
                    .cloned()
                    .collect()
            });
            Ok(revisions)
        } else {
            Err(AppError::EntityNotFound(
                "Document does not belong to the specified project".to_string(),
            ))
        }
    } else {
        // TODO: asuming REVISIONS.length == 0. Probably needs more error handling
        Ok(vec![])
    }
}

#[query]
fn list_revisions(
    project_id: ProjectId,
    document_id: DocumentId,
    pagination: PaginationInput,
) -> PaginatedRevisionsResult {
    let revisions =
        get_revisions(project_id, document_id).expect("Something went wrong getting revision");

    match paginate(&revisions, pagination.page_size, pagination.page_number) {
        Ok((paginated_revisions, pagination_metadata)) => {
            PaginatedRevisionsResult::Ok(paginated_revisions, pagination_metadata)
        }
        Err(e) => PaginatedRevisionsResult::Err(e),
    }
}

fn get_revision_range(
    document_id: DocumentId,
    start_index: usize,
    end_index: usize,
) -> Vec<Revision> {
    if let Some(document) = get_document_by_id(document_id) {
        let revision_ids = &document.revisions;
        REVISIONS.with(|revisions| {
            let revisions = revisions.borrow();
            let range = if start_index <= end_index {
                start_index..=end_index
            } else {
                end_index..=start_index
            };

            let mut revs: Vec<Revision> = revision_ids[range]
                .iter()
                .filter_map(|&rev_id| revisions.get(&rev_id).cloned())
                .collect();

            if start_index > end_index {
                revs.reverse();
            }

            revs
        })
    } else {
        vec![]
    }
}

#[query]
pub fn diff_revisions(
    start_revision_id: RevisionId,
    end_revision_id: RevisionId,
) -> RevisionsResult {
    let start_revision_result = get_revision(start_revision_id);
    let end_revision_result = get_revision(end_revision_id);

    match (start_revision_result, end_revision_result) {
        (RevisionResult::Ok(start), RevisionResult::Ok(end))
            if start.document_id == end.document_id =>
        {
            let document_id = start.document_id;
            if let Some(document) = get_document_by_id(document_id) {
                let start_index_option = document
                    .revisions
                    .iter()
                    .position(|&id| id == start_revision_id);
                let end_index_option = document
                    .revisions
                    .iter()
                    .position(|&id| id == end_revision_id);

                if let (Some(start_index), Some(end_index)) = (start_index_option, end_index_option)
                {
                    let revisions = get_revision_range(document_id, start_index, end_index);
                    RevisionsResult::Ok(revisions)
                } else {
                    RevisionsResult::Err(AppError::EntityNotFound(
                        "Revisions not found in document".to_string(),
                    ))
                }
            } else {
                RevisionsResult::Err(AppError::EntityNotFound("Document not found".to_string()))
            }
        }
        (RevisionResult::Ok(_), RevisionResult::Ok(_)) => RevisionsResult::Err(
            AppError::InternalError("Revisions are from different documents".to_string()),
        ),
        (RevisionResult::Err(err), _) | (_, RevisionResult::Err(err)) => RevisionsResult::Err(err),
    }
}
