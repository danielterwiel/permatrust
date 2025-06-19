use crate::revisions::revisions_manager::RevisionsManager;
use shared::types::revisions::{DownloadRevisionContentInput, DownloadRevisionContentResult};

#[ic_cdk_macros::query]
pub fn download_revision_content(
    input: DownloadRevisionContentInput,
) -> DownloadRevisionContentResult {
    RevisionsManager::download_revision_content_operation(input)
}
