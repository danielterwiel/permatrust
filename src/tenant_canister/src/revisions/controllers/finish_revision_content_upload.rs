use crate::revisions::revisions_manager::RevisionsManager;
use shared::types::revisions::{
    FinishRevisionContentUploadInput, FinishRevisionContentUploadResult,
};

#[ic_cdk_macros::update]
pub fn finish_revision_content_upload(
    input: FinishRevisionContentUploadInput,
) -> FinishRevisionContentUploadResult {
    RevisionsManager::finish_revision_content_upload_operation(input)
}
