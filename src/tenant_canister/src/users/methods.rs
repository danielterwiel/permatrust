use super::state;
use crate::logger::{log_info, loggable_user};
use candid::Principal;
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
    let user = CreateInitUserInput {
        principal,
        first_name: input.first_name,
        last_name: input.last_name,
    };
    create_new_user(user)
}

pub fn create_new_user(input: CreateInitUserInput) -> CreateUserResult {
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

    let user_id = state::get_next_id();
    let principals = vec![input.principal];
    let user = User::new(user_id, principals, input.first_name, input.last_name);

    state::insert(user.clone());
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
    let principal = ic_cdk::api::msg_caller();
    let user_result = get_user_by_principal(principal);
    match user_result {
        GetUserResult::Ok(user) => {
            log_info("get_user", loggable_user(&user));
            GetUserResult::Ok(user)
        }
        GetUserResult::Err(e) => {
            log_info("get_user", format!("Error: {:?}", e));
            GetUserResult::Err(e)
        }
    }
}

pub fn get_user_by_principal(principal: Principal) -> GetUserResult {
    match state::get_by_principal(principal) {
        Some(user) => GetUserResult::Ok(user),
        None => GetUserResult::Err(AppError::EntityNotFound("User not found".to_string())),
    }
}
