use crate::users::user_manager::UserManager;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::consts::memory_ids::tenant_canister::INVITES_MEMORY_ID;
use shared::types::errors::AppError;
use shared::types::invites::{Invite, InviteId};
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::users::GetUserResult;
use shared::utils::pagination::paginate;
use shared::utils::random::random;
use shared::{log_debug, log_info, log_warn};
use std::cell::RefCell;
use std::sync::atomic::{AtomicU64, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static INVITES : RefCell<StableBTreeMap<InviteId, Invite, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(INVITES_MEMORY_ID))),
        )
    );

    static NEXT_ID: AtomicU64 = const { AtomicU64::new(0) };
}

pub struct InvitesManager {}

impl InvitesManager {
    fn get_next_id() -> InviteId {
        NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
    }

    fn get_all() -> Vec<Invite> {
        INVITES.with(|invites| {
            invites
                .borrow()
                .iter()
                .map(|(_, invite)| invite.clone())
                .collect()
        })
    }

    fn insert(id: InviteId, invite: Invite) {
        INVITES.with(|invites| {
            invites.borrow_mut().insert(id, invite);
        });
    }

    fn get_by_random(random: &String) -> Option<Invite> {
        INVITES.with(|invites| {
            invites
                .borrow()
                .iter()
                .find(|(_, invite)| &invite.random == random)
                .map(|(_, invite)| invite.clone())
        })
    }

    pub async fn create_invite(caller: candid::Principal) -> Result<Invite, AppError> {
        log_debug!("auth_check: Invite creation attempt [principal={}]", caller);

        // TODO: Add permission validation here when authorization system is implemented
        // log_debug!("access_control: Checking invite creation permissions [principal={}]", caller);

        log_debug!(
            "auth_check: Validating user for invite creation [principal={}]",
            caller
        );
        let user = match UserManager::get_user_by_principal(caller) {
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
                return Err(e);
            }
        };

        let id = Self::get_next_id();
        let random_token = random(32).await;
        let invite = Invite {
            id,
            random: random_token,
            created_at: ic_cdk::api::time(),
            created_by: user.id,
            accepted_by: None,
            accepted_at: None,
        };

        Self::insert(id, invite.clone());
        log_info!("invite_creation: Successfully created invite [id={}, created_by={}, principal={}, random={}, timestamp={}]",
                 invite.id, invite.created_by, caller, invite.random, invite.created_at);

        Ok(invite)
    }

    pub fn get_invite_by_random(
        random: String,
        principal: candid::Principal,
    ) -> Result<Invite, AppError> {
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

        let invite_result = Self::get_by_random(&random);
        match invite_result {
            Some(invite) => {
                log_info!("invite_access: Successfully retrieved invite [id={}, random={}, created_by={}, principal={}]",
                         invite.id, invite.random, invite.created_by, principal);
                Ok(invite)
            }
            None => {
                log_warn!("invite_access: Security event - invalid invite token accessed [random={}, principal={}]",
                         random, principal);
                Err(AppError::EntityNotFound(format!(
                    "Error: Invite with random {} not found",
                    random
                )))
            }
        }
    }

    pub fn list_invites(
        pagination: PaginationInput,
        principal: candid::Principal,
    ) -> Result<(Vec<Invite>, PaginationMetadata), AppError> {
        log_debug!(
            "auth_check: Invite listing attempt [principal={}, page={}, size={}]",
            principal,
            pagination.page_number,
            pagination.page_size
        );

        // TODO: Add permission validation here when authorization system is implemented
        // log_debug!("access_control: Checking invite listing permissions [principal={}]", principal);

        let invites = Self::get_all();
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
                Ok(result)
            }
            Err(e) => {
                shared::log_error!(
                    "invite_access: Pagination failed [principal={}] - {:?}",
                    principal,
                    e
                );
                Err(e)
            }
        }
    }
}
