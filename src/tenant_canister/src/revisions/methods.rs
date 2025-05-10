use super::state;
use super::*;
use crate::documents;
use crate::logger::{log_info, loggable_revision};
use crate::users::methods::get_user_by_principal;
use shared::types::revisions::{
    CreateRevisionInput, CreateRevisionResult, DiffRevisionsInput, DiffRevisionsResult,
    ListRevisionsInput, ListRevisionsResult,
};
use shared::types::users::GetUserResult;
use shared::utils::pagination::paginate;

#[ic_cdk_macros::update]
pub fn create_revision(input: CreateRevisionInput) -> CreateRevisionResult {
    match documents::get_by_id(input.document_id) {
        Some(document) if document.project_id == input.project_id => {
            let new_revision_id = state::get_next_id();
            let version = document.version + 1;
            let caller = ic_cdk::api::msg_caller();
            let user = match get_user_by_principal(caller) {
                GetUserResult::Ok(u) => u,
                GetUserResult::Err(e) => return CreateRevisionResult::Err(e),
            };

            let new_revision = Revision {
                id: new_revision_id,
                version,
                document_id: input.document_id,
                project_id: input.project_id,
                content: input.content,
                created_at: ic_cdk::api::time(),
                created_by: user.id,
            };

            state::insert(new_revision_id, new_revision.clone());
            documents::update_revision(input.document_id, version, new_revision_id);
            log_info("create_revision", loggable_revision(&new_revision));

            CreateRevisionResult::Ok(new_revision_id)
        }
        Some(_) => CreateRevisionResult::Err(AppError::EntityNotFound(
            "Document does not belong to the specified project".to_string(),
        )),
        None => {
            CreateRevisionResult::Err(AppError::EntityNotFound("Document not found".to_string()))
        }
    }
}

#[ic_cdk_macros::query]
pub fn list_revisions(input: ListRevisionsInput) -> ListRevisionsResult {
    let revisions = state::get_all();

    match paginate(
        &revisions,
        input.pagination.page_size,
        input.pagination.page_number,
        input.pagination.filters,
        input.pagination.sort,
    ) {
        Ok(result) => ListRevisionsResult::Ok(result),
        Err(e) => ListRevisionsResult::Err(e),
    }
}

#[ic_cdk_macros::query]
pub fn get_diff_revisions(input: DiffRevisionsInput) -> DiffRevisionsResult {
    let start_revision = match state::get_by_id(input.original) {
        Some(r) => r,
        None => {
            return DiffRevisionsResult::Err(AppError::EntityNotFound(
                "Start revision not found".to_string(),
            ))
        }
    };

    let end_revision = match state::get_by_id(input.updated) {
        Some(r) => r,
        None => {
            return DiffRevisionsResult::Err(AppError::EntityNotFound(
                "End revision not found".to_string(),
            ))
        }
    };

    if start_revision.document_id != end_revision.document_id {
        return DiffRevisionsResult::Err(AppError::InternalError(
            "Revisions are from different documents".to_string(),
        ));
    }

    let document_id = start_revision.document_id;
    let document = match documents::get_by_id(document_id) {
        Some(d) => d,
        None => {
            return DiffRevisionsResult::Err(AppError::EntityNotFound(
                "Document not found".to_string(),
            ))
        }
    };

    let start_index = match document
        .revisions
        .iter()
        .position(|&id| id == input.original)
    {
        Some(i) => i,
        None => {
            return DiffRevisionsResult::Err(AppError::EntityNotFound(
                "Start revision not found in document".to_string(),
            ))
        }
    };

    let end_index = match document
        .revisions
        .iter()
        .position(|&id| id == input.updated)
    {
        Some(i) => i,
        None => {
            return DiffRevisionsResult::Err(AppError::EntityNotFound(
                "End revision not found in document".to_string(),
            ))
        }
    };

    let revisions = state::get_revision_range(document_id, start_index, end_index);

    DiffRevisionsResult::Ok(revisions)
}
