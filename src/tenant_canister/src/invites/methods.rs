use super::state;
use super::*;

use shared::types::errors::AppError;
use shared::types::invites::{CreateInviteResult, GetInviteResult, ListInvitesResult};
use shared::types::users::GetUserResult;
use shared::utils::pagination::paginate;
use shared::utils::random::random;

use crate::users::methods::get_user_by_principal;
use shared::{log_debug, log_error, log_info, log_warn};

#[ic_cdk_macros::update]
pub async fn create_invite() -> CreateInviteResult {
    let caller = ic_cdk::api::msg_caller();
    log_debug!("auth_check: Invite creation attempt [principal={}]", caller);

    // TODO: Add permission validation here when authorization system is implemented
    // log_debug!("access_control: Checking invite creation permissions [principal={}]", caller);

    log_debug!(
        "auth_check: Validating user for invite creation [principal={}]",
        caller
    );
    let user = match get_user_by_principal(caller) {
        GetUserResult::Ok(u) => {
            log_debug!(
                "auth_check: User validated for invite creation [user_id={}, principal={}]",
                u.id,
                caller
            );
            u
        }
        GetUserResult::Err(e) => {
            log_warn!(
                "auth_check: Authentication failed for invite creation [principal={}] - {:?}",
                caller,
                e
            );
            return CreateInviteResult::Err(e);
        }
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
    log_info!("invite_creation: Successfully created invite [id={}, created_by={}, principal={}, random={}, timestamp={}]", 
             invite.id, invite.created_by, caller, invite.random, invite.created_at);

    CreateInviteResult::Ok(invite)
}

#[ic_cdk_macros::query]
pub fn get_invite(random: String) -> GetInviteResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Invite retrieval attempt [principal={}, random={}]",
        principal,
        random
    );

    // Note: Invite access by random token is a form of authentication
    log_debug!(
        "invite_access: Looking up invite by random token [random={}]",
        random
    );

    let invite_result = state::get_by_random(&random);
    match invite_result {
        Some(invite) => {
            log_info!("invite_access: Successfully retrieved invite [id={}, random={}, created_by={}, principal={}]", 
                     invite.id, invite.random, invite.created_by, principal);
            GetInviteResult::Ok(invite)
        }
        None => {
            log_warn!("invite_access: Security event - invalid invite token accessed [random={}, principal={}]", 
                     random, principal);
            GetInviteResult::Err(AppError::EntityNotFound(format!(
                "Error: Invite with random {} not found",
                random
            )))
        }
    }
}

#[ic_cdk_macros::query]
pub fn list_invites(pagination: PaginationInput) -> ListInvitesResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Invite listing attempt [principal={}, page={}, size={}]",
        principal,
        pagination.page_number,
        pagination.page_size
    );

    // TODO: Add permission validation here when authorization system is implemented
    // log_debug!("access_control: Checking invite listing permissions [principal={}]", principal);

    let invites = state::get_all();
    log_debug!(
        "invite_access: Retrieved invites [principal={}, total_count={}]",
        principal,
        invites.len()
    );

    match paginate(
        &invites,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok(result) => {
            log_debug!(
                "invite_access: Paginated invite results [principal={}, page_items={}, total={}]",
                principal,
                result.0.len(),
                invites.len()
            );
            ListInvitesResult::Ok(result)
        }
        Err(e) => {
            log_error!(
                "invite_access: Pagination failed [principal={}] - {:?}",
                principal,
                e
            );
            ListInvitesResult::Err(e)
        }
    }
}
