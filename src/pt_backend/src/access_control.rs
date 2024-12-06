use ic_cdk_macros::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};

use shared::types::access_control::{EntityPermission, Role, RoleId};
use shared::types::errors::AppError;

thread_local! {
    static ROLES: RefCell<HashMap<RoleId, Role>> = RefCell::new(HashMap::new());
    static NEXT_ROLE_ID: AtomicU64 = AtomicU64::new(0);
}

pub fn get_next_role_id() -> RoleId {
    NEXT_ROLE_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

#[update]
pub fn create_role(
    name: String,
    description: String,
    permissions: Vec<EntityPermission>,
) -> Result<RoleId, AppError> {
    if name.trim().is_empty() {
        return Err(AppError::InternalError(
            "Role name cannot be empty".to_string(),
        ));
    }

    let id = get_next_role_id();
    let role = Role {
        id,
        name,
        description,
        permissions,
    };

    ROLES.with(|roles| {
        roles.borrow_mut().insert(id, role);
    });

    Ok(id)
}

#[update]
pub fn assign_permissions_to_role(
    role_id: RoleId,
    permissions: Vec<EntityPermission>,
) -> Result<(), AppError> {
    if permissions.is_empty() {
        return Ok(());
    }

    ROLES.with(|roles| {
        let mut roles = roles.borrow_mut();

        let role = roles
            .get_mut(&role_id)
            .ok_or_else(|| AppError::EntityNotFound("Role not found".to_string()))?;

        let new_permissions: Vec<_> = permissions
            .into_iter()
            .filter(|p| !role.permissions.contains(p))
            .collect();

        role.permissions.reserve(new_permissions.len());
        role.permissions.extend(new_permissions);

        Ok(())
    })
}

#[update]
pub fn remove_permissions_from_role(
    role_id: RoleId,
    permissions: Vec<EntityPermission>,
) -> Result<(), AppError> {
    if permissions.is_empty() {
        return Ok(());
    }

    ROLES.with(|roles| {
        let mut roles = roles.borrow_mut();

        let role = roles
            .get_mut(&role_id)
            .ok_or_else(|| AppError::EntityNotFound("Role not found".to_string()))?;

        role.permissions.retain(|p| !permissions.contains(p));
        Ok(())
    })
}

#[query]
pub fn get_role(role_id: RoleId) -> Result<Role, AppError> {
    get_role_by_id(role_id)
}

pub fn get_role_by_id(role_id: RoleId) -> Result<Role, AppError> {
    ROLES.with(|roles| match roles.borrow().get(&role_id) {
        Some(role) => Ok(role.clone()),
        None => Err(AppError::EntityNotFound("Role not found".to_string())),
    })
}

#[query]
pub fn list_roles() -> Result<Vec<Role>, AppError> {
    let roles = ROLES.with(|roles| roles.borrow().values().cloned().collect());
    Ok(roles)
}

pub fn role_exists(role_id: RoleId) -> bool {
    ROLES.with(|roles| roles.borrow().contains_key(&role_id))
}
