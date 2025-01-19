use crate::documents::document_utils;
use crate::logger::{log_info, loggable_revision};
use crate::users::get_user_by_principal;
use ic_cdk_macros::{query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::types::documents::DocumentId;
use shared::types::errors::AppError;
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::projects::ProjectId;
use shared::types::revisions::{Revision, RevisionId};
use shared::utils::pagination::paginate;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU64, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static REVISIONS: RefCell<StableBTreeMap<RevisionId, Revision, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(5))),
        )
    );

    static NEXT_ID: AtomicU64 = const { AtomicU64::new(0) };
}

mod revision_utils {
    use super::*;

    pub fn get_next_id() -> RevisionId {
        NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
    }

    pub fn get_all() -> Vec<Revision> {
        REVISIONS.with(|revisions| {
            revisions
                .borrow()
                .iter()
                .map(|(_, rev)| rev.clone())
                .collect()
        })
    }

    pub fn insert(revision_id: RevisionId, revision: Revision) {
        REVISIONS.with(|revisions| {
            revisions.borrow_mut().insert(revision_id, revision);
        });
    }

    pub fn get_by_id(revision_id: RevisionId) -> Option<Revision> {
        REVISIONS.with(|revisions| revisions.borrow().get(&revision_id))
    }

    pub fn get_by_document_id(document_id: DocumentId) -> Result<Vec<Revision>, AppError> {
        if let Some(document) = document_utils::get_by_id(document_id) {
            let revisions = REVISIONS.with(|revisions| {
                revisions
                    .borrow()
                    .iter()
                    .filter(|(_, rev)| rev.document_id == document.id)
                    .map(|(_, rev)| rev.clone())
                    .collect()
            });
            Ok(revisions)
        } else {
            Err(AppError::EntityNotFound(
                "Document does not belong to the specified project".to_string(),
            ))
        }
    }

    pub fn get_revision_range(
        document_id: DocumentId,
        start_index: usize,
        end_index: usize,
    ) -> Vec<Revision> {
        if let Some(document) = document_utils::get_by_id(document_id) {
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
                    .filter_map(|&rev_id| revisions.get(&rev_id))
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
}

#[update]
pub fn create_revision(
    project_id: ProjectId,
    document_id: DocumentId,
    content: serde_bytes::ByteBuf,
) -> Result<RevisionId, AppError> {
    match document_utils::get_by_id(document_id) {
        Some(document) if document.project == project_id => {
            let new_revision_id = revision_utils::get_next_id();
            let version = document.version + 1;
            let user = get_user_by_principal(ic_cdk::caller())?;

            let new_revision = Revision {
                id: new_revision_id,
                version,
                document_id,
                project_id,
                content,
                created_at: ic_cdk::api::time(),
                created_by: user.id,
            };

            revision_utils::insert(new_revision_id, new_revision.clone());
            document_utils::update_revision(document_id, version, new_revision_id);
            log_info("create_revision", loggable_revision(&new_revision));

            Ok(new_revision_id)
        }
        Some(_) => Err(AppError::EntityNotFound(
            "Document does not belong to the specified project".to_string(),
        )),
        None => Err(AppError::EntityNotFound("Document not found".to_string())),
    }
}

#[query]
fn get_revision(revision_id: RevisionId) -> Result<Revision, AppError> {
    revision_utils::get_by_id(revision_id)
        .ok_or(AppError::EntityNotFound("Revision not found".to_string()))
}

#[query]
fn list_revisions(
    pagination: PaginationInput,
) -> Result<(Vec<Revision>, PaginationMetadata), AppError> {
    let revisions = revision_utils::get_all();

    match paginate(
        &revisions,
        pagination.page_size,
        pagination.page_number,
        pagination.filters.clone(),
        pagination.sort.clone(),
    ) {
        Ok((paginated_revisions, pagination_metadata)) => {
            Ok((paginated_revisions, pagination_metadata))
        }
        Err(e) => Err(e),
    }
}

#[query]
fn list_revisions_by_document_id(
    document_id: DocumentId,
    pagination: PaginationInput,
) -> Result<(Vec<Revision>, PaginationMetadata), AppError> {
    let revisions = revision_utils::get_by_document_id(document_id)?;

    match paginate(
        &revisions,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok((paginated_revisions, pagination_metadata)) => {
            Ok((paginated_revisions, pagination_metadata))
        }
        Err(e) => Err(e),
    }
}

#[query]
fn diff_revisions(
    start_revision_id: RevisionId,
    end_revision_id: RevisionId,
) -> Result<Vec<Revision>, AppError> {
    let start_revision = revision_utils::get_by_id(start_revision_id).ok_or(
        AppError::EntityNotFound("Start revision not found".to_string()),
    )?;
    let end_revision = revision_utils::get_by_id(end_revision_id).ok_or(
        AppError::EntityNotFound("End revision not found".to_string()),
    )?;

    if start_revision.document_id != end_revision.document_id {
        return Err(AppError::InternalError(
            "Revisions are from different documents".to_string(),
        ));
    }

    let document_id = start_revision.document_id;
    let document = document_utils::get_by_id(document_id)
        .ok_or(AppError::EntityNotFound("Document not found".to_string()))?;

    let start_index = document
        .revisions
        .iter()
        .position(|&id| id == start_revision_id)
        .ok_or(AppError::EntityNotFound(
            "Start revision not found in document".to_string(),
        ))?;

    let end_index = document
        .revisions
        .iter()
        .position(|&id| id == end_revision_id)
        .ok_or(AppError::EntityNotFound(
            "End revision not found in document".to_string(),
        ))?;

    let revisions = revision_utils::get_revision_range(document_id, start_index, end_index);
    Ok(revisions)
}
