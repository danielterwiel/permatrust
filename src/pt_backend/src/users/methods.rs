use super::state;
use super::*;
use crate::logger::{log_info, loggable_user};
use shared::{
    types::users::{CreateUserResult, GetUserResult, ListUsersInput, ListUsersResult},
    utils::pagination::paginate,
};

#[ic_cdk_macros::update]
pub fn create_user(input: CreateUserInput) -> CreateUserResult {
    if input.first_name.trim().is_empty() {
        return CreateUserResult::Err(AppError::InternalError(
            "First name cannot be empty".to_string(),
        ));
    }
    if input.last_name.trim().is_empty() {
        return CreateUserResult::Err(AppError::InternalError(
            "Last name cannot be empty".to_string(),
        ));
    }

    let id = state::get_next_id();
    let principal = ic_cdk::caller();
    let user = User::new(
        id,
        principal,
        input.first_name,
        input.last_name,
        input.organizations,
    );

    state::insert(id, user.clone());
    log_info("create_user", loggable_user(&user));

    CreateUserResult::Ok(user)
}

#[ic_cdk_macros::query]
pub fn list_users(input: ListUsersInput) -> ListUsersResult {
    let users = state::get_all();

    match paginate(
        &users,
        input.pagination.page_size,
        input.pagination.page_number,
        input.pagination.filters,
        input.pagination.sort,
    ) {
        Ok(result) => ListUsersResult::Ok(result),
        Err(e) => ListUsersResult::Err(e),
    }
}

#[ic_cdk_macros::query]
pub fn get_user() -> GetUserResult {
    let principal = ic_cdk::caller();
    get_user_by_principal(principal)
}

pub fn get_user_by_id(id: UserId) -> GetUserResult {
    match state::get_by_id(id) {
        Some(user) => GetUserResult::Ok(user),
        None => GetUserResult::Err(AppError::EntityNotFound("User not found".to_string())),
    }
}

pub fn get_user_by_principal(principal: Principal) -> GetUserResult {
    match state::get_by_principal(principal) {
        Some(user) => GetUserResult::Ok(user),
        None => GetUserResult::Err(AppError::EntityNotFound("User not found".to_string())),
    }
}
