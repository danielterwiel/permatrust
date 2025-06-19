use crate::invites::invites_manager::InvitesManager;
use shared::types::invites::ListInvitesResult;
use shared::types::pagination::PaginationInput;

#[ic_cdk_macros::query]
pub fn list_invites(pagination: PaginationInput) -> ListInvitesResult {
    let principal = ic_cdk::api::msg_caller();

    match InvitesManager::list_invites(pagination, principal) {
        Ok(result) => ListInvitesResult::Ok(result),
        Err(e) => ListInvitesResult::Err(e),
    }
}
