use super::state;
use super::*;
use crate::documents;
use crate::users::user_manager::UserManager;
use shared::types::revisions::{
    CreateRevisionInput, CreateRevisionResult, DiffRevisionsInput, DiffRevisionsResult,
    DownloadRevisionContentInput, DownloadRevisionContentResult, FinishRevisionContentUploadInput,
    FinishRevisionContentUploadResult, GetRevisionContentChunkInput, GetRevisionContentChunkResult,
    GetRevisionContentInput, GetRevisionContentResult, ListRevisionContentsInput,
    ListRevisionContentsResult, ListRevisionsInput, ListRevisionsResult,
    StoreRevisionContentChunkInput, StoreRevisionContentChunkResult,
};
use shared::types::users::GetUserResult;
use shared::utils::pagination::paginate;
use shared::{log_debug, log_error, log_info, log_warn};

#[ic_cdk_macros::update]
pub fn create_revision(input: CreateRevisionInput) -> CreateRevisionResult {
    let caller = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Revision creation attempt [principal={}, document_id={}, project_id={}]",
        caller,
        input.document_id,
        input.project_id
    );

    log_debug!(
        "revision_creation: Validating document access [document_id={}, project_id={}]",
        input.document_id,
        input.project_id
    );

    match documents::get_by_id(input.document_id) {
        Some(document) if document.project_id == input.project_id => {
            log_debug!(
                "revision_creation: Document validated [document_id={}, current_version={}]",
                input.document_id,
                document.version
            );

            let new_revision_id = state::get_next_id();
            let version = document.version + 1;

            log_debug!(
                "auth_check: Validating user for revision creation [principal={}]",
                caller
            );

            let user = match UserManager::get_user_by_principal(caller) {
                GetUserResult::Ok(u) => {
                    log_debug!(
                        "auth_check: User validated for revision creation [user_id={}, principal={}]",
                        u.id,
                        caller
                    );
                    u
                }
                GetUserResult::Err(e) => {
                    log_warn!(
                        "auth_check: Authentication failed for revision creation [principal={}, document_id={}] - {:?}",
                        caller,
                        input.document_id,
                        e
                    );
                    return CreateRevisionResult::Err(e);
                }
            };

            // Store content separately and collect content IDs
            let content_ids: Vec<u64> = input
                .contents
                .iter()
                .map(|content| {
                    match &content.content_data {
                        Some(content_data) => {
                            // New content - create and store it
                            let bytes = match content_data {
                                shared::types::revisions::RevisionContentData::Direct { bytes } => {
                                    bytes.clone()
                                }
                                shared::types::revisions::RevisionContentData::Chunked { .. } => {
                                    // This should not happen in normal create_revision flow
                                    // as chunked content should be uploaded separately
                                    vec![]
                                }
                            };
                            let revision_content = state::create_revision_content_with_metadata(
                                bytes,
                                content.content_type.clone(),
                                content.file_name.clone(),
                            );
                            state::insert_revision_content(revision_content)
                        }
                        None => {
                            // Reference to existing content - validate access and reuse ID
                            // SECURITY: Must validate that the user has access to this content
                            // TODO: Implement proper access control validation
                            log_debug!(
                                "revision_creation: Referencing existing content [content_id={}, principal={}]",
                                content.id,
                                caller
                            );

                            // For now, just verify the content exists (minimal validation)
                            // This should be enhanced with proper access control checks
                            match state::get_revision_content_by_id(content.id) {
                                Some(_) => content.id,
                                None => {
                                    log_warn!(
                                        "revision_creation: Referenced content not found [content_id={}, principal={}]",
                                        content.id,
                                        caller
                                    );
                                    // Create empty content as fallback - this should be an error in production
                                    let revision_content = state::create_revision_content_with_metadata(
                                        vec![],
                                        content.content_type.clone(),
                                        content.file_name.clone(),
                                    );
                                    state::insert_revision_content(revision_content)
                                }
                            }
                        }
                    }
                })
                .collect();

            let new_revision = Revision {
                id: new_revision_id,
                version,
                document_id: input.document_id,
                project_id: input.project_id,
                contents: content_ids,
                created_at: ic_cdk::api::time(),
                created_by: user.id,
            };

            log_debug!(
                "revision_creation: Creating revision entity [id={}, version={}, content_count={}]",
                new_revision_id,
                version,
                input.contents.len()
            );

            state::insert(new_revision_id, new_revision.clone());
            documents::update_revision(input.document_id, version, new_revision_id);

            log_info!(
                "revision_creation: Successfully created revision [id={}, document_id={}, version={}, user_id={}, principal={}, project_id={}, timestamp={}]",
                new_revision.id,
                new_revision.document_id,
                new_revision.version,
                user.id,
                caller,
                input.project_id,
                new_revision.created_at
            );

            CreateRevisionResult::Ok(new_revision_id)
        }
        Some(_) => {
            log_warn!(
                "revision_creation: Project mismatch [document_id={}, expected_project={}, principal={}]",
                input.document_id,
                input.project_id,
                caller
            );
            CreateRevisionResult::Err(AppError::EntityNotFound(
                "Document does not belong to the specified project".to_string(),
            ))
        }
        None => {
            log_warn!(
                "revision_creation: Document not found [document_id={}, principal={}]",
                input.document_id,
                caller
            );
            CreateRevisionResult::Err(AppError::EntityNotFound("Document not found".to_string()))
        }
    }
}

#[ic_cdk_macros::query]
pub fn list_revisions(input: ListRevisionsInput) -> ListRevisionsResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Revision listing attempt [principal={}, page={}, size={}]",
        principal,
        input.pagination.page_number,
        input.pagination.page_size
    );

    // TODO: Add permission validation here when authorization system is implemented
    // log_debug!("access_control: Checking revision listing permissions [principal={}]", principal);

    log_debug!(
        "revision_listing: Processing request [principal={}, page={}, size={}]",
        principal,
        input.pagination.page_number,
        input.pagination.page_size
    );

    let revisions = state::get_all();
    log_debug!(
        "revision_access: Retrieved revisions [principal={}, total_count={}]",
        principal,
        revisions.len()
    );

    match paginate(
        &revisions,
        input.pagination.page_size,
        input.pagination.page_number,
        input.pagination.filters,
        input.pagination.sort,
    ) {
        Ok(result) => {
            log_info!(
                "revision_listing: Listed revisions [principal={}, page_items={}, total={}]",
                principal,
                result.0.len(),
                revisions.len()
            );
            log_debug!(
                "revision_listing: Paginated results [page_items={}, total={}]",
                result.0.len(),
                revisions.len()
            );
            ListRevisionsResult::Ok(result)
        }
        Err(e) => {
            log_error!(
                "revision_access: Revision listing failed [principal={}] - {:?}",
                principal,
                e
            );
            log_warn!(
                "revision_listing: Pagination failed [principal={}] - {:?}",
                principal,
                e
            );
            ListRevisionsResult::Err(e)
        }
    }
}

#[ic_cdk_macros::query]
pub fn get_diff_revisions(input: DiffRevisionsInput) -> DiffRevisionsResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Revision diff attempt [principal={}, original={}, updated={}]",
        principal,
        input.original,
        input.updated
    );

    log_debug!(
        "revision_diff: Validating start revision [revision_id={}]",
        input.original
    );

    let start_revision = match state::get_by_id(input.original) {
        Some(r) => {
            log_debug!(
                "revision_diff: Start revision found [revision_id={}, document_id={}, version={}]",
                r.id,
                r.document_id,
                r.version
            );
            r
        }
        None => {
            log_warn!(
                "revision_diff: Start revision not found [revision_id={}, principal={}]",
                input.original,
                principal
            );
            return DiffRevisionsResult::Err(AppError::EntityNotFound(
                "Start revision not found".to_string(),
            ));
        }
    };

    log_debug!(
        "revision_diff: Validating end revision [revision_id={}]",
        input.updated
    );

    let end_revision = match state::get_by_id(input.updated) {
        Some(r) => {
            log_debug!(
                "revision_diff: End revision found [revision_id={}, document_id={}, version={}]",
                r.id,
                r.document_id,
                r.version
            );
            r
        }
        None => {
            log_warn!(
                "revision_diff: End revision not found [revision_id={}, principal={}]",
                input.updated,
                principal
            );
            return DiffRevisionsResult::Err(AppError::EntityNotFound(
                "End revision not found".to_string(),
            ));
        }
    };

    if start_revision.document_id != end_revision.document_id {
        log_warn!(
            "revision_diff: Document mismatch [start_document={}, end_document={}, principal={}]",
            start_revision.document_id,
            end_revision.document_id,
            principal
        );
        return DiffRevisionsResult::Err(AppError::InternalError(
            "Revisions are from different documents".to_string(),
        ));
    }

    let document_id = start_revision.document_id;
    log_debug!(
        "revision_diff: Validating document [document_id={}]",
        document_id
    );

    let document = match documents::get_by_id(document_id) {
        Some(d) => {
            log_debug!(
                "revision_diff: Document found [document_id={}, revision_count={}]",
                document_id,
                d.revisions.len()
            );
            d
        }
        None => {
            log_warn!(
                "revision_diff: Document not found [document_id={}, principal={}]",
                document_id,
                principal
            );
            return DiffRevisionsResult::Err(AppError::EntityNotFound(
                "Document not found".to_string(),
            ));
        }
    };

    let start_index = match document
        .revisions
        .iter()
        .position(|&id| id == input.original)
    {
        Some(i) => {
            log_debug!(
                "revision_diff: Start revision index found [index={}, revision_id={}]",
                i,
                input.original
            );
            i
        }
        None => {
            log_warn!(
                "revision_diff: Start revision not found in document [revision_id={}, document_id={}, principal={}]",
                input.original,
                document_id,
                principal
            );
            return DiffRevisionsResult::Err(AppError::EntityNotFound(
                "Start revision not found in document".to_string(),
            ));
        }
    };

    let end_index = match document
        .revisions
        .iter()
        .position(|&id| id == input.updated)
    {
        Some(i) => {
            log_debug!(
                "revision_diff: End revision index found [index={}, revision_id={}]",
                i,
                input.updated
            );
            i
        }
        None => {
            log_warn!(
                "revision_diff: End revision not found in document [revision_id={}, document_id={}, principal={}]",
                input.updated,
                document_id,
                principal
            );
            return DiffRevisionsResult::Err(AppError::EntityNotFound(
                "End revision not found in document".to_string(),
            ));
        }
    };

    log_debug!(
        "revision_diff: Retrieving revision range [document_id={}, start_index={}, end_index={}]",
        document_id,
        start_index,
        end_index
    );

    let revisions = state::get_revision_range(document_id, start_index, end_index);

    log_info!(
        "revision_diff: Successfully generated diff [document_id={}, start_revision={}, end_revision={}, revision_count={}, principal={}]",
        document_id,
        input.original,
        input.updated,
        revisions.len(),
        principal
    );

    DiffRevisionsResult::Ok(revisions)
}

// Chunking methods for large revision content uploads
#[ic_cdk_macros::update]
pub fn store_revision_content_chunk(
    input: StoreRevisionContentChunkInput,
) -> StoreRevisionContentChunkResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "chunk_upload: Storing content chunk [principal={}, revision_id={}, content_index={}, chunk_size={}]",
        principal,
        input.revision_id,
        input.content_index,
        input.chunk.data.len()
    );

    match state::store_revision_content_chunk(
        input.revision_id,
        input.content_index,
        input.chunk,
        input.content_type,
        input.file_name,
    ) {
        Ok(_) => {
            log_debug!(
                "chunk_upload: Successfully stored chunk [revision_id={}, content_index={}, principal={}]",
                input.revision_id,
                input.content_index,
                principal
            );
            StoreRevisionContentChunkResult::Ok(())
        }
        Err(e) => {
            log_error!(
                "chunk_upload: Failed to store chunk [revision_id={}, content_index={}, principal={}] - {}",
                input.revision_id,
                input.content_index,
                principal,
                e
            );
            StoreRevisionContentChunkResult::Err(AppError::InternalError(e))
        }
    }
}

#[ic_cdk_macros::query]
pub fn get_revision_content_chunk(
    input: GetRevisionContentChunkInput,
) -> GetRevisionContentChunkResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "chunk_download: Retrieving content chunk [principal={}, revision_id={}, content_index={}, chunk_id={}]",
        principal,
        input.revision_id,
        input.content_index,
        input.chunk_id
    );

    match state::get_revision_content_chunk(input.revision_id, input.content_index, input.chunk_id)
    {
        Some(chunk) => {
            log_debug!(
                "chunk_download: Chunk found [revision_id={}, content_index={}, chunk_id={}, chunk_size={}, principal={}]",
                input.revision_id,
                input.content_index,
                input.chunk_id,
                chunk.data.len(),
                principal
            );
            GetRevisionContentChunkResult::Ok(Some(chunk))
        }
        None => {
            log_debug!(
                "chunk_download: Chunk not found [revision_id={}, content_index={}, chunk_id={}, principal={}]",
                input.revision_id,
                input.content_index,
                input.chunk_id,
                principal
            );
            GetRevisionContentChunkResult::Ok(None)
        }
    }
}

#[ic_cdk_macros::update]
pub fn finish_revision_content_upload(
    input: FinishRevisionContentUploadInput,
) -> FinishRevisionContentUploadResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "chunk_upload: Finalizing content upload [principal={}, revision_id={}, content_index={}]",
        principal,
        input.revision_id,
        input.content_index
    );

    match state::finish_revision_content_upload(input.revision_id, input.content_index) {
        Ok(_) => {
            log_info!(
                "chunk_upload: Successfully finalized content upload [revision_id={}, content_index={}, principal={}]",
                input.revision_id,
                input.content_index,
                principal
            );
            FinishRevisionContentUploadResult::Ok(())
        }
        Err(e) => {
            log_error!(
                "chunk_upload: Failed to finalize content upload [revision_id={}, content_index={}, principal={}] - {}",
                input.revision_id,
                input.content_index,
                principal,
                e
            );
            FinishRevisionContentUploadResult::Err(AppError::InternalError(e))
        }
    }
}

#[ic_cdk_macros::query]
pub fn get_revision_content(input: GetRevisionContentInput) -> GetRevisionContentResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "content_access: Getting revision content [principal={}, content_id={}]",
        principal,
        input.content_id
    );

    match state::get_revision_content_by_id(input.content_id) {
        Some(content) => {
            let size_info = match &content.content_data {
                Some(content_data) => match content_data {
                    shared::types::revisions::RevisionContentData::Direct { bytes } => {
                        format!("direct size: {}", bytes.len())
                    }
                    shared::types::revisions::RevisionContentData::Chunked {
                        total_size,
                        total_chunks,
                        ..
                    } => format!("chunked size: {} ({} chunks)", total_size, total_chunks),
                },
                None => "referenced content (no data)".to_string(),
            };
            log_debug!(
                "content_access: Revision content found [content_id={}, {}, type={:?}, principal={}]",
                input.content_id,
                size_info,
                content.content_type,
                principal
            );
            GetRevisionContentResult::Ok(content)
        }
        None => {
            log_debug!(
                "content_access: Revision content not found [content_id={}, principal={}]",
                input.content_id,
                principal
            );
            GetRevisionContentResult::Err(AppError::EntityNotFound(
                "Revision content not found".to_string(),
            ))
        }
    }
}

#[ic_cdk_macros::query]
pub fn list_revision_contents(input: ListRevisionContentsInput) -> ListRevisionContentsResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "content_listing: Listing revision contents [principal={}, revision_id={}]",
        principal,
        input.revision_id
    );

    // TODO: Add permission validation here when authorization system is implemented
    let contents = state::list_revision_contents_by_revision_id(input.revision_id);

    log_info!(
        "content_listing: Listed revision contents [principal={}, revision_id={}, content_count={}]",
        principal,
        input.revision_id,
        contents.len()
    );

    ListRevisionContentsResult::Ok(contents)
}

#[ic_cdk_macros::query]
pub fn download_revision_content(
    input: DownloadRevisionContentInput,
) -> DownloadRevisionContentResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "content_download: Downloading revision content [principal={}, content_id={}, chunk_id={:?}]",
        principal,
        input.content_id,
        input.chunk_id
    );

    match state::get_revision_content_by_id(input.content_id) {
        Some(content) => match &content.content_data {
            Some(content_data) => match content_data {
                shared::types::revisions::RevisionContentData::Direct { bytes } => {
                    if input.chunk_id.is_some() {
                        log_warn!(
                                "content_download: Chunk requested for direct content [content_id={}, principal={}]",
                                input.content_id,
                                principal
                            );
                        return DownloadRevisionContentResult::Err(AppError::InvalidInput(
                            "Direct content does not have chunks".to_string(),
                        ));
                    }
                    log_debug!(
                            "content_download: Returning direct content [content_id={}, size={}, principal={}]",
                            input.content_id,
                            bytes.len(),
                        principal
                    );
                    DownloadRevisionContentResult::Ok(bytes.clone())
                }
                shared::types::revisions::RevisionContentData::Chunked {
                    total_chunks,
                    revision_id,
                    content_index,
                    ..
                } => match input.chunk_id {
                    Some(chunk_id) => {
                        if chunk_id >= *total_chunks {
                            log_warn!(
                                    "content_download: Invalid chunk ID [content_id={}, chunk_id={}, total_chunks={}, principal={}]",
                                    input.content_id,
                                    chunk_id,
                                    total_chunks,
                                    principal
                                );
                            return DownloadRevisionContentResult::Err(AppError::InvalidInput(
                                format!(
                                    "Chunk ID {} is invalid for content with {} chunks",
                                    chunk_id, total_chunks
                                ),
                            ));
                        }

                        match state::get_revision_content_chunk(
                            *revision_id,
                            *content_index,
                            chunk_id,
                        ) {
                            Some(chunk) => {
                                log_debug!(
                                        "content_download: Returning chunk [content_id={}, chunk_id={}, size={}, principal={}]",
                                        input.content_id,
                                        chunk_id,
                                        chunk.data.len(),
                                        principal
                                    );
                                DownloadRevisionContentResult::Ok(chunk.data)
                            }
                            None => {
                                log_warn!(
                                        "content_download: Chunk not found [content_id={}, chunk_id={}, principal={}]",
                                        input.content_id,
                                        chunk_id,
                                        principal
                                    );
                                DownloadRevisionContentResult::Err(AppError::EntityNotFound(
                                    "Chunk not found".to_string(),
                                ))
                            }
                        }
                    }
                    None => {
                        log_warn!(
                                "content_download: No chunk ID provided for chunked content [content_id={}, principal={}]",
                                input.content_id,
                                principal
                            );
                        DownloadRevisionContentResult::Err(AppError::InvalidInput(
                            "Chunk ID required for chunked content".to_string(),
                        ))
                    }
                },
            },
            None => {
                log_warn!(
                    "content_download: Attempted to download referenced content with no data [content_id={}, principal={}]",
                    input.content_id,
                    principal
                );
                DownloadRevisionContentResult::Err(AppError::InvalidInput(
                    "Cannot download referenced content - no data stored".to_string(),
                ))
            }
        },
        None => {
            log_warn!(
                "content_download: Content not found [content_id={}, principal={}]",
                input.content_id,
                principal
            );
            DownloadRevisionContentResult::Err(AppError::EntityNotFound(
                "Content not found".to_string(),
            ))
        }
    }
}
