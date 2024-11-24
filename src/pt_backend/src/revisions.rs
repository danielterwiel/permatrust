use crate::logger::{log_info, loggable_revision};
use ic_cdk_macros::{query, update};

use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};

use shared::types::documents::DocumentId;
use shared::types::errors::AppError;
use shared::types::pagination::PaginationInput;
use shared::types::projects::ProjectId;
use shared::types::revisions::{
    PaginatedRevisionsResult, PaginatedRevisionsResultOk, Revision, RevisionId, RevisionIdResult,
    RevisionResult, RevisionsResult,
};

use shared::utils::pagination::paginate;

use crate::documents::{get_document_by_id, update_document_revision};

thread_local! {
    static REVISIONS: RefCell<HashMap<RevisionId, Revision>> = RefCell::new(HashMap::new());
    static NEXT_ID: AtomicU64 = AtomicU64::new(0);
}

pub fn get_next_revision_id() -> u64 {
    NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

fn get_revisions() -> Vec<Revision> {
    REVISIONS.with(|revisions| revisions.borrow().values().cloned().collect())
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
    match get_document_by_id(document_id) {
        Some(document) if document.project == project_id => {
            let new_revision_id = get_next_revision_id();
            let version = document.version + 1;

            let new_revision = Revision {
                id: new_revision_id,
                version,
                document_id,
                project_id,
                content,
                created_at: ic_cdk::api::time(),
                created_by: ic_cdk::caller(),
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

pub fn get_revisions_by_document_id(document_id: DocumentId) -> Result<Vec<Revision>, AppError> {
    if let Some(document) = get_document_by_id(document_id) {
        let revisions = REVISIONS.with(|revisions| {
            revisions
                .borrow()
                .values()
                .filter(|rev| rev.document_id == document.id)
                .cloned()
                .collect()
        });
        Ok(revisions)
    } else {
        Err(AppError::EntityNotFound(
            "Document does not belong to the specified project".to_string(),
        ))
    }
}

#[query]
fn list_revisions(pagination: PaginationInput) -> PaginatedRevisionsResult {
    let revisions = get_revisions();

    match paginate(
        &revisions,
        pagination.page_size,
        pagination.page_number,
        pagination.filters.clone(),
        pagination.sort.clone(),
    ) {
        Ok((paginated_revisions, pagination_metadata)) => {
            let result = PaginatedRevisionsResultOk(paginated_revisions, pagination_metadata);
            PaginatedRevisionsResult::Ok(result)
        }
        Err(e) => PaginatedRevisionsResult::Err(e),
    }
}

#[query]
fn list_revisions_by_document_id(
    document_id: DocumentId,
    pagination: PaginationInput,
) -> PaginatedRevisionsResult {
    let revisions =
        get_revisions_by_document_id(document_id).expect("Something went wrong getting revision");
    match paginate(
        &revisions,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok((paginated_revisions, pagination_metadata)) => PaginatedRevisionsResult::Ok(
            PaginatedRevisionsResultOk(paginated_revisions, pagination_metadata),
        ),
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
