use candid::Principal;
use ic_cdk_macros::{query, update};

use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::vec;

use shared::types::errors::AppError;
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::users::{CreateUserInput, User, UserId};

use shared::utils::pagination::paginate;

use crate::logger::{log_info, loggable_user};

thread_local! {
    static USERS: RefCell<HashMap<UserId, User>> = RefCell::new(HashMap::new());
    static NEXT_ID: AtomicU64 = AtomicU64::new(0);
}

pub fn get_next_user_id() -> u64 {
    NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

#[update]
fn create_user(input: CreateUserInput) -> Result<User, AppError> {
    let CreateUserInput {
        first_name,
        last_name,
    } = input;
    if first_name.trim().is_empty() {
        return Err(AppError::InternalError(
            "First name cannot be empty".to_string(),
        ));
    }
    if last_name.trim().is_empty() {
        return Err(AppError::InternalError(
            "Last name cannot be empty".to_string(),
        ));
    }

    let id = get_next_user_id();
    let user = User {
        id,
        first_name,
        last_name,
        principals: vec![ic_cdk::caller()],
        organizations: vec![],
    };

    USERS.with(|users| {
        users.borrow_mut().insert(id, user.clone());
    });

    log_info("create_user", loggable_user(&user));

    Ok(user)
}

#[query]
fn list_users(pagination: PaginationInput) -> Result<(Vec<User>, PaginationMetadata), AppError> {
    let users = USERS.with(|users| users.borrow().values().cloned().collect::<Vec<_>>());

    match paginate(
        &users,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok((paginated_users, pagination_metadata)) => Ok((paginated_users, pagination_metadata)),
        Err(e) => Err(e),
    }
}

#[query]
fn get_user() -> Result<User, AppError> {
    let principal = ic_cdk::caller();
    return get_user_by_principal(principal);
}

pub fn get_user_by_principal(principal: Principal) -> Result<User, AppError> {
    let user = USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.principals.contains(&principal))
            .map(|(_, user)| user.clone())
    });

    return match user {
        Some(user) => Ok(user),
        None => Err(AppError::EntityNotFound("User not found".to_string())),
    };
}
