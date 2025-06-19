use crate::revisions::revisions_manager::RevisionsManager;
use shared::types::revisions::{GetRevisionContentChunkInput, GetRevisionContentChunkResult};

#[ic_cdk_macros::query]
pub fn get_revision_content_chunk(
    input: GetRevisionContentChunkInput,
) -> GetRevisionContentChunkResult {
    RevisionsManager::get_revision_content_chunk_operation(input)
}
