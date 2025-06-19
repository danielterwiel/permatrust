use crate::revisions::revisions_manager::RevisionsManager;
use shared::types::revisions::{StoreRevisionContentChunkInput, StoreRevisionContentChunkResult};

#[ic_cdk_macros::update]
pub fn store_revision_content_chunk(
    input: StoreRevisionContentChunkInput,
) -> StoreRevisionContentChunkResult {
    RevisionsManager::store_revision_content_chunk_operation(input)
}
