use candid::Principal;
use ic_cdk_macros::{query, update};

use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::vec;

use shared::types::access_control::{EntityPermission, RoleId};
use shared::types::errors::AppError;
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::users::{CreateUserInput, User, UserId};

use shared::utils::pagination::paginate;

use crate::access_control::{get_role_by_id, role_exists};
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
        principal_id: ic_cdk::caller(),
        roles: vec![],
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

pub fn get_user_by_id(user_id: UserId) -> Result<User, AppError> {
    USERS.with(|users| match users.borrow().get(&user_id) {
        Some(user) => Ok(user.clone()),
        None => Err(AppError::EntityNotFound("User not found".to_string())),
    })
}

pub fn get_user_by_principal(principal: Principal) -> Result<User, AppError> {
    let user = USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.principal_id == principal)
            .map(|(_, user)| user.clone())
    });

    return match user {
        Some(user) => Ok(user),
        None => Err(AppError::EntityNotFound("User not found".to_string())),
    };
}

#[update]
pub fn assign_role_to_user(user_id: UserId, role_id: RoleId) -> Result<(), AppError> {
    // Check if the role exists
    if !role_exists(role_id) {
        return Err(AppError::EntityNotFound("Role not found".to_string()));
    }

    USERS.with(|users| {
        let mut users = users.borrow_mut();
        match users.get_mut(&user_id) {
            Some(user) => {
                let role = get_role_by_id(role_id)?;
                if !user.roles.contains(&role) {
                    user.roles.push(role);
                }
                Ok(())
            }
            None => Err(AppError::EntityNotFound("User not found".to_string())),
        }
    })
}

// Update method to remove a role from a user
#[update]
pub fn remove_role_from_user(user_id: UserId, role_id: RoleId) -> Result<(), AppError> {
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        match users.get_mut(&user_id) {
            Some(user) => {
                let role = get_role_by_id(role_id)?;
                user.roles.retain(|r| *r != role);
                Ok(())
            }
            None => Err(AppError::EntityNotFound("User not found".to_string())),
        }
    })
}

// Helper function to check if a user has a specific permission
pub fn user_has_permission(user_id: UserId, permission: EntityPermission) -> bool {
    let user = get_user_by_id(user_id);

    match user {
        Ok(user) => {
            for role in user.roles {
                let role = get_role_by_id(role.id);
                match role {
                    Ok(role) => {
                        if role.permissions.iter().any(|perm| perm == &permission) {
                            return true;
                        }
                    }
                    Err(_) => continue,
                }
            }
            false
        }
        Err(_) => false,
    }
}

// Query method to check if the current user has a specific permission
#[query]
pub fn check_permission(permission: EntityPermission) -> Result<bool, AppError> {
    let principal = ic_cdk::caller();
    match get_user_by_principal(principal) {
        Ok(user) => {
            let has_perm = user_has_permission(user.id, permission);
            Ok(has_perm)
        }
        Err(e) => Err(e),
    }
}
