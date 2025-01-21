use super::*;
use crate::documents;
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
    if let Some(document) = documents::get_by_id(document_id) {
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
    if let Some(document) = documents::get_by_id(document_id) {
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
