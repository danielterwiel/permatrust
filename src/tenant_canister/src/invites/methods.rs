use super::state;
use super::*;

use shared::types::errors::AppError;
use shared::types::invites::{CreateInviteResult, GetInviteResult, ListInvitesResult};
use shared::types::users::GetUserResult;
use shared::utils::pagination::paginate;
use shared::utils::random::random;

use crate::logger::{log_info, loggable_invite};
use crate::users::methods::get_user_by_principal;

#[ic_cdk_macros::update]
pub async fn create_invite() -> CreateInviteResult {
    let caller = ic_cdk::api::msg_caller();
    let user = match get_user_by_principal(caller) {
        GetUserResult::Ok(u) => u,
        GetUserResult::Err(e) => return CreateInviteResult::Err(e),
    };

    let id = state::get_next_id();
    let random = random(32).await;
    let invite = Invite {
        id,
        random,
        created_at: ic_cdk::api::time(),
        created_by: user.id,
        accepted_by: None,
        accepted_at: None,
    };

    state::insert(id, invite.clone());
    log_info("create_invite", loggable_invite(&invite));

    CreateInviteResult::Ok(invite)
}

#[ic_cdk_macros::query]
pub fn get_invite(random: String) -> GetInviteResult {
    let invite_result = state::get_by_random(&random);
    match invite_result {
        Some(invite) => {
            log_info("get_invite", loggable_invite(&invite));
            GetInviteResult::Ok(invite)
        }
        None => {
            log_info(
                "get_invite",
                format!("Error: Invite with random {} not found", random),
            );
            GetInviteResult::Err(AppError::EntityNotFound(format!(
                "Error: Invite with random {} not found",
                random
            )))
        }
    }
}

#[ic_cdk_macros::query]
pub fn list_invites(pagination: PaginationInput) -> ListInvitesResult {
    let invites = state::get_all();

    match paginate(
        &invites,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok(result) => ListInvitesResult::Ok(result),
        Err(e) => ListInvitesResult::Err(e),
    }
}
