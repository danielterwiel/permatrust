use crate::revisions::revisions_manager::RevisionsManager;
use shared::types::revisions::{DiffRevisionsInput, DiffRevisionsResult};

#[ic_cdk_macros::query]
pub fn get_diff_revisions(input: DiffRevisionsInput) -> DiffRevisionsResult {
    RevisionsManager::get_diff_revisions(input)
}
