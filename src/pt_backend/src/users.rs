use ic_cdk_macros::{query, update};
use shared::types::users::{PaginatedUsersResult, User, UserId, UserIdResult, UserResult};
use shared::utils::pagination::paginate;

use shared::types::errors::AppError;
use shared::types::pagination::PaginationInput;

use std::cell::RefCell;
use std::collections::HashMap;
// use std::sync::atomic::{AtomicU64, Ordering};
use std::vec;

use crate::logger::{log_info, loggable_user};

thread_local! {
    static USERS: RefCell<HashMap<UserId, User>> = RefCell::new(HashMap::new());
    // static NEXT_ID: AtomicU64 = AtomicU64::new(0);
}

// pub fn get_next_user_id() -> u64 {
//     NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
// }

#[update]
fn create_user(first_name: String, last_name: String) -> UserIdResult {
    if first_name.trim().is_empty() {
        return UserIdResult::Err(AppError::InternalError(
            "First name cannot be empty".to_string(),
        ));
    }
    if last_name.trim().is_empty() {
        return UserIdResult::Err(AppError::InternalError(
            "Last name cannot be empty".to_string(),
        ));
    }

    let id = ic_cdk::caller();
    let user = User {
        id, // TODO:
        first_name,
        last_name,
        roles: vec![],
        organisations: vec![],
    };

    USERS.with(|users| {
        users.borrow_mut().insert(id, user.clone());
    });

    log_info("create_user", loggable_user(&user));

    UserIdResult::Ok(id)
}

#[query]
fn list_users(pagination: PaginationInput) -> PaginatedUsersResult {
    let users = USERS.with(|users| users.borrow().values().cloned().collect::<Vec<_>>());

    match paginate(
        &users,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok((paginated_users, pagination_metadata)) => {
            PaginatedUsersResult::Ok(paginated_users, pagination_metadata)
        }
        Err(e) => PaginatedUsersResult::Err(e),
    }
}

#[query]
fn get_user() -> UserResult {
    let user_id = ic_cdk::caller();
    USERS.with(|users| match users.borrow().get(&user_id) {
        Some(user) => UserResult::Ok(user.clone()),
        None => UserResult::Err(AppError::EntityNotFound("User not found".to_string())),
    })
}

#[query]
pub fn get_user_by_id(user_id: UserId) -> UserResult {
    USERS.with(|users| match users.borrow().get(&user_id) {
        Some(user) => UserResult::Ok(user.clone()),
        None => UserResult::Err(AppError::EntityNotFound("User not found".to_string())),
    })
}
