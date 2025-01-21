use super::state;
use super::*;
use crate::logger::{log_info, loggable_user};
use shared::utils::pagination::paginate;

#[ic_cdk_macros::update]
pub fn create_user(input: CreateUserInput) -> Result<User, AppError> {
    if input.first_name.trim().is_empty() {
        return Err(AppError::InternalError(
            "First name cannot be empty".to_string(),
        ));
    }
    if input.last_name.trim().is_empty() {
        return Err(AppError::InternalError(
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

    Ok(user)
}

#[ic_cdk_macros::query]
pub fn list_users(
    pagination: PaginationInput,
) -> Result<(Vec<User>, PaginationMetadata), AppError> {
    let users = state::get_all();

    paginate(
        &users,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[ic_cdk_macros::query]
pub fn get_user() -> Result<User, AppError> {
    let principal = ic_cdk::caller();
    get_user_by_principal(principal)
}

pub fn get_user_by_id(id: UserId) -> Result<User, AppError> {
    state::get_by_id(id).ok_or_else(|| AppError::EntityNotFound("User not found".to_string()))
}

pub fn get_user_by_principal(principal: Principal) -> Result<User, AppError> {
    state::find_by_principal(principal)
        .ok_or_else(|| AppError::EntityNotFound("User not found".to_string()))
}
