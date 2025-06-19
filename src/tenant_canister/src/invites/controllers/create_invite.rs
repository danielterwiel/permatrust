use crate::invites::invites_manager::InvitesManager;
use shared::types::invites::CreateInviteResult;

#[ic_cdk_macros::update]
pub async fn create_invite() -> CreateInviteResult {
    let caller = ic_cdk::api::msg_caller();

    match InvitesManager::create_invite(caller).await {
        Ok(invite) => CreateInviteResult::Ok(invite),
        Err(e) => CreateInviteResult::Err(e),
    }
}
