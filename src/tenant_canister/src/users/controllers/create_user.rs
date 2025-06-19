use crate::users::user_manager::UserManager;
use shared::types::users::{CreateUserInput, CreateUserResult};

#[ic_cdk_macros::query]
pub fn create_user(input: CreateUserInput) -> CreateUserResult {
    let principal = ic_cdk::api::msg_caller();
    UserManager::create_user(input, principal)
}
