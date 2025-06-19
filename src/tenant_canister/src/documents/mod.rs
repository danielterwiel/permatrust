pub mod controllers;
pub mod document_manager;

// Re-export public functions that other modules need
pub use document_manager::DocumentManager;

// Re-export specific functions for backward compatibility
pub fn get_by_id(
    document_id: shared::types::documents::DocumentId,
) -> Option<shared::types::documents::Document> {
    DocumentManager::get_by_id(document_id)
}

pub fn update_revision(
    document_id: shared::types::documents::DocumentId,
    version: u8,
    revision_id: shared::types::revisions::RevisionId,
) {
    DocumentManager::update_revision(document_id, version, revision_id)
}
