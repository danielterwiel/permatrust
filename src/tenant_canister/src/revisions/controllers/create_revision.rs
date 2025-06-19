use crate::revisions::revisions_manager::RevisionsManager;
use shared::types::revisions::{CreateRevisionInput, CreateRevisionResult};

#[ic_cdk_macros::update]
pub fn create_revision(input: CreateRevisionInput) -> CreateRevisionResult {
    RevisionsManager::create_revision(input)
}
