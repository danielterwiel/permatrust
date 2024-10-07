use ic_cdk_macros::{query, update};
use shared::pagination::{paginate, PaginatedUsersResult};
use shared::pt_backend_generated::{
    AppError, PaginationInput, User, UserId, UserIdResult, UserResult,
};
use std::cell::RefCell;
use std::collections::HashMap;
use std::vec;

use crate::logger::{log_info, loggable_user};

thread_local! {
    static USERS: RefCell<HashMap<UserId, User>> = RefCell::new(HashMap::new());
}

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
        id,
        first_name,
        last_name,
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

    match paginate(&users, pagination.page_size, pagination.page_number) {
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
