use crate::revisions::revisions_manager::RevisionsManager;
use shared::types::revisions::{ListRevisionContentsInput, ListRevisionContentsResult};

#[ic_cdk_macros::query]
pub fn list_revision_contents(input: ListRevisionContentsInput) -> ListRevisionContentsResult {
    RevisionsManager::list_revision_contents_operation(input)
}
