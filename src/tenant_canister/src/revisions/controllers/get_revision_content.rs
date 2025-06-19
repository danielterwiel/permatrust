use crate::revisions::revisions_manager::RevisionsManager;
use shared::types::revisions::{GetRevisionContentInput, GetRevisionContentResult};

#[ic_cdk_macros::query]
pub fn get_revision_content(input: GetRevisionContentInput) -> GetRevisionContentResult {
    RevisionsManager::get_revision_content_operation(input)
}
