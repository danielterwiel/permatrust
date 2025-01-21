use super::state;
use super::*;
use crate::documents;
use crate::logger::{log_info, loggable_revision};
use crate::users::get_user_by_principal;
use shared::utils::pagination::paginate;

#[ic_cdk_macros::update]
pub fn create_revision(
    project_id: ProjectId,
    document_id: DocumentId,
    content: serde_bytes::ByteBuf,
) -> Result<RevisionId, AppError> {
    match documents::get_by_id(document_id) {
        Some(document) if document.project == project_id => {
            let new_revision_id = state::get_next_id();
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

            state::insert(new_revision_id, new_revision.clone());
            documents::update_revision(document_id, version, new_revision_id);
            log_info("create_revision", loggable_revision(&new_revision));

            Ok(new_revision_id)
        }
        Some(_) => Err(AppError::EntityNotFound(
            "Document does not belong to the specified project".to_string(),
        )),
        None => Err(AppError::EntityNotFound("Document not found".to_string())),
    }
}

#[ic_cdk_macros::query]
pub fn get_revision(revision_id: RevisionId) -> Result<Revision, AppError> {
    state::get_by_id(revision_id).ok_or(AppError::EntityNotFound("Revision not found".to_string()))
}

#[ic_cdk_macros::query]
pub fn list_revisions(
    pagination: PaginationInput,
) -> Result<(Vec<Revision>, PaginationMetadata), AppError> {
    let revisions = state::get_all();
    paginate(
        &revisions,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[ic_cdk_macros::query]
pub fn list_revisions_by_document_id(
    document_id: DocumentId,
    pagination: PaginationInput,
) -> Result<(Vec<Revision>, PaginationMetadata), AppError> {
    let revisions = state::get_by_document_id(document_id)?;
    paginate(
        &revisions,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[ic_cdk_macros::query]
pub fn diff_revisions(
    start_revision_id: RevisionId,
    end_revision_id: RevisionId,
) -> Result<Vec<Revision>, AppError> {
    let start_revision = state::get_by_id(start_revision_id).ok_or(AppError::EntityNotFound(
        "Start revision not found".to_string(),
    ))?;
    let end_revision = state::get_by_id(end_revision_id).ok_or(AppError::EntityNotFound(
        "End revision not found".to_string(),
    ))?;

    if start_revision.document_id != end_revision.document_id {
        return Err(AppError::InternalError(
            "Revisions are from different documents".to_string(),
        ));
    }

    let document_id = start_revision.document_id;
    let document = documents::get_by_id(document_id)
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

    let revisions = state::get_revision_range(document_id, start_index, end_index);
    Ok(revisions)
}
