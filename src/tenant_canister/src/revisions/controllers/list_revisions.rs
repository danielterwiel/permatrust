use crate::revisions::revisions_manager::RevisionsManager;
use shared::types::revisions::{ListRevisionsInput, ListRevisionsResult};

#[ic_cdk_macros::query]
pub fn list_revisions(input: ListRevisionsInput) -> ListRevisionsResult {
    RevisionsManager::list_revisions(input)
}
