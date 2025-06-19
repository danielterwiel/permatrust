use candid::Principal;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::consts::memory_ids::tenant_canister::USERS_MEMORY_ID;
use shared::types::{
    errors::AppError,
    users::{
        CreateInitUserInput, CreateUserInput, CreateUserResult, GetUserResult, ListUsersInput,
        ListUsersResult, User, UserId,
    },
};
use shared::utils::{logs::loggable_user, pagination::paginate};
use shared::{log_debug, log_error, log_info, log_warn};
use std::cell::RefCell;
use std::sync::atomic::{AtomicU8, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static USERS: RefCell<StableBTreeMap<UserId, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(USERS_MEMORY_ID))),
        )
    );

    static NEXT_ID: AtomicU8= const { AtomicU8::new(0) };
}

pub struct UserManager;

impl UserManager {
    pub fn get_next_id() -> u8 {
        NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
    }

    pub fn insert(user: User) {
        USERS.with(|users| {
            users.borrow_mut().insert(user.id, user);
        });
    }

    pub fn get_all() -> Vec<User> {
        USERS.with(|users| {
            users
                .borrow()
                .iter()
                .map(|(_, user)| user.clone())
                .collect()
        })
    }

    pub fn get_by_principal(principal: Principal) -> Option<User> {
        USERS.with(|users| {
            users
                .borrow()
                .iter()
                .find(|(_, user)| user.principals.contains(&principal))
                .map(|(_, user)| user.clone())
        })
    }

    pub fn create_user(input: CreateUserInput, caller_principal: Principal) -> CreateUserResult {
        log_debug!(
            "auth_check: User creation attempt [principal={}, name='{} {}']",
            caller_principal,
            input.first_name,
            input.last_name
        );

        // TODO: Add permission validation here when authorization system is implemented
        // log_debug!("access_control: Checking user creation permissions [principal={}]", caller_principal);

        log_debug!(
            "user_creation: Creating user [principal={}, name='{} {}']",
            caller_principal,
            input.first_name,
            input.last_name
        );

        let user = CreateInitUserInput {
            principal: caller_principal,
            first_name: input.first_name,
            last_name: input.last_name,
        };
        Self::create_new_user(user)
    }

    pub fn create_new_user(input: CreateInitUserInput) -> CreateUserResult {
        log_debug!(
            "auth_check: User creation with principal [principal={}, name='{} {}']",
            input.principal,
            input.first_name,
            input.last_name
        );
        log_debug!(
            "validation: Validating user input [principal={}, name='{} {}']",
            input.principal,
            input.first_name,
            input.last_name
        );

        if input.first_name.trim().is_empty() {
            log_warn!(
                "validation: Security violation - invalid first name [principal={}, value='{}']",
                input.principal,
                input.first_name
            );
            return CreateUserResult::Err(AppError::InternalError(
                "First name cannot be empty".to_string(),
            ));
        }
        if input.last_name.trim().is_empty() {
            log_warn!(
                "validation: Security violation - invalid last name [principal={}, value='{}']",
                input.principal,
                input.last_name
            );
            return CreateUserResult::Err(AppError::InternalError(
                "Last name cannot be empty".to_string(),
            ));
        }

        let user_id = Self::get_next_id();
        let principals = vec![input.principal];
        let user = User::new(user_id, principals, input.first_name, input.last_name);

        Self::insert(user.clone());
        log_info!(
            "user_creation: Created {} [principal={}]",
            loggable_user(&user),
            input.principal
        );

        CreateUserResult::Ok(user)
    }

    pub fn list_users(input: ListUsersInput, caller_principal: Principal) -> ListUsersResult {
        log_debug!(
            "auth_check: User listing attempt [principal={}, page={}, size={}]",
            caller_principal,
            input.pagination.page_number,
            input.pagination.page_size
        );

        // TODO: Add permission validation here when authorization system is implemented
        // log_debug!("access_control: Checking user listing permissions [principal={}]", caller_principal);

        log_debug!(
            "user_listing: Processing request [principal={}, page={}, size={}]",
            caller_principal,
            input.pagination.page_number,
            input.pagination.page_size
        );

        let users = Self::get_all();
        log_debug!(
            "user_listing: Retrieved users [total_count={}]",
            users.len()
        );

        match paginate(
            &users,
            input.pagination.page_size,
            input.pagination.page_number,
            input.pagination.filters,
            input.pagination.sort,
        ) {
            Ok(result) => {
                log_debug!(
                    "user_listing: Paginated results [page_items={}, total={}]",
                    result.0.len(),
                    users.len()
                );
                ListUsersResult::Ok(result)
            }
            Err(e) => {
                log_error!(
                    "user_listing: Operation failed [principal={}] - {:?}",
                    caller_principal,
                    e
                );
                ListUsersResult::Err(e)
            }
        }
    }

    pub fn get_user(caller_principal: Principal) -> GetUserResult {
        log_debug!(
            "auth_check: Current user retrieval attempt [principal={}]",
            caller_principal
        );
        log_debug!(
            "user_retrieval: Getting current user [principal={}]",
            caller_principal
        );

        let user_result = Self::get_user_by_principal(caller_principal);
        match user_result {
            GetUserResult::Ok(user) => {
                log_debug!(
                    "user_retrieval: Retrieved current user [id={}, principal={}]",
                    user.id,
                    caller_principal
                );
                GetUserResult::Ok(user)
            }
            GetUserResult::Err(e) => {
                log_warn!(
                    "auth_check: Authentication failed - user not found [principal={}] - {:?}",
                    caller_principal,
                    e
                );
                GetUserResult::Err(e)
            }
        }
    }

    pub fn get_user_by_principal(principal: Principal) -> GetUserResult {
        log_debug!(
            "auth_check: Principal-based user lookup [principal={}]",
            principal
        );
        log_debug!("user_retrieval: Looking up user [principal={}]", principal);

        match Self::get_by_principal(principal) {
            Some(user) => {
                log_info!(
                    "auth_check: Authenticated {} [principal={}]",
                    loggable_user(&user),
                    principal
                );
                log_debug!(
                    "user_retrieval: Found user [id={}, principal={}]",
                    user.id,
                    principal
                );
                GetUserResult::Ok(user)
            }
            None => {
                log_warn!(
                    "auth_check: Authentication failed - user not found [principal={}, timestamp={}]",
                    principal,
                    ic_cdk::api::time()
                );
                log_debug!("user_retrieval: User not found [principal={}]", principal);
                GetUserResult::Err(AppError::EntityNotFound(format!(
                    "User with principal {} not found",
                    principal
                )))
            }
        }
    }
}
