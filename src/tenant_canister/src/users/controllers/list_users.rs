use crate::users::user_manager::UserManager;
use shared::types::users::{ListUsersInput, ListUsersResult};

#[ic_cdk_macros::query]
pub fn list_users(input: ListUsersInput) -> ListUsersResult {
    let principal = ic_cdk::api::msg_caller();
    UserManager::list_users(input, principal)
}
