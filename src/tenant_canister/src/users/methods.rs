use super::state;
use candid::Principal;
use shared::utils::logs::loggable_user;
use shared::{log_debug, log_error, log_info, log_warn};
use shared::{
    types::{
        errors::AppError,
        users::{
            CreateInitUserInput, CreateUserInput, CreateUserResult, GetUserResult, ListUsersInput,
            ListUsersResult, User,
        },
    },
    utils::pagination::paginate,
};

#[ic_cdk_macros::query]
pub fn create_user(input: CreateUserInput) -> CreateUserResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: User creation attempt [principal={}, name='{} {}']",
        principal,
        input.first_name,
        input.last_name
    );

    // TODO: Add permission validation here when authorization system is implemented
    // log_debug!("access_control: Checking user creation permissions [principal={}]", principal);

    log_debug!(
        "user_creation: Creating user [principal={}, name='{} {}']",
        principal,
        input.first_name,
        input.last_name
    );

    let user = CreateInitUserInput {
        principal,
        first_name: input.first_name,
        last_name: input.last_name,
    };
    create_new_user(user)
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

    let user_id = state::get_next_id();
    let principals = vec![input.principal];
    let user = User::new(user_id, principals, input.first_name, input.last_name);

    state::insert(user.clone());
    log_info!(
        "user_creation: Created {} [principal={}]",
        loggable_user(&user),
        input.principal
    );

    CreateUserResult::Ok(user)
}

#[ic_cdk_macros::query]
pub fn list_users(input: ListUsersInput) -> ListUsersResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: User listing attempt [principal={}, page={}, size={}]",
        principal,
        input.pagination.page_number,
        input.pagination.page_size
    );

    // TODO: Add permission validation here when authorization system is implemented
    // log_debug!("access_control: Checking user listing permissions [principal={}]", principal);

    log_debug!(
        "user_listing: Processing request [principal={}, page={}, size={}]",
        principal,
        input.pagination.page_number,
        input.pagination.page_size
    );

    let users = state::get_all();
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
                principal,
                e
            );
            ListUsersResult::Err(e)
        }
    }
}

#[ic_cdk_macros::query]
pub fn get_user() -> GetUserResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Current user retrieval attempt [principal={}]",
        principal
    );
    log_debug!(
        "user_retrieval: Getting current user [principal={}]",
        principal
    );

    let user_result = get_user_by_principal(principal);
    match user_result {
        GetUserResult::Ok(user) => {
            log_debug!(
                "user_retrieval: Retrieved current user [id={}, principal={}]",
                user.id,
                principal
            );
            GetUserResult::Ok(user)
        }
        GetUserResult::Err(e) => {
            log_warn!(
                "auth_check: Authentication failed - user not found [principal={}] - {:?}",
                principal,
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

    match state::get_by_principal(principal) {
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
