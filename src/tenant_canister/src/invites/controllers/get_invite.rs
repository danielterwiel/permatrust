use crate::invites::invites_manager::InvitesManager;
use shared::types::invites::GetInviteResult;

#[ic_cdk_macros::query]
pub fn get_invite(random: String) -> GetInviteResult {
    let principal = ic_cdk::api::msg_caller();

    match InvitesManager::get_invite_by_random(random, principal) {
        Ok(invite) => GetInviteResult::Ok(invite),
        Err(e) => GetInviteResult::Err(e),
    }
}
