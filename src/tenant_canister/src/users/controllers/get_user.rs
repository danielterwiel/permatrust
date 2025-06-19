use crate::users::user_manager::UserManager;
use shared::types::users::GetUserResult;

#[ic_cdk_macros::query]
pub fn get_user() -> GetUserResult {
    let principal = ic_cdk::api::msg_caller();
    UserManager::get_user(principal)
}
