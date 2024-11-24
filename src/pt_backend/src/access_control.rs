// use candid::Principal;
// use ic_cdk::api::caller;
// use ic_cdk_macros::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{
    AtomicU64,
    // Ordering
};

use shared::types::access_control::{
    // AppError, EntityPermission, Permission,
    Role,
    RoleId,
    // RoleIdResult, RoleInput,
};

// use crate::users::get_user_by_id;

thread_local! {
    static ROLES: RefCell<HashMap<RoleId, Role>> = RefCell::new(HashMap::new());
    static NEXT_ID: AtomicU64 = AtomicU64::new(0);
}

// pub fn get_next_role_id() -> RoleId {
//     NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
// }

// pub fn ensure_permission(
//     required_entity: EntityPermission,
//     required_permission: Permission,
// ) -> Result<(), AppError> {
//     let caller_id = caller();
//
//     if let Some(user) = get_user_by_id(&caller_id) {
//         for role in &user.roles {
//             for entity_permission in &role.permissions {
//                 if matches!(
//                     (entity_permission, &required_entity),
//                     (EntityPermission::User(perms), EntityPermission::User(_))
//                 ) {
//                     if let EntityPermission::User(permissions) = entity_permission {
//                         if permissions.contains(&required_permission) {
//                             return Ok(());
//                         }
//                     }
//                 }
//             }
//         }
//         Err(AppError::Unauthorized(
//             "Insufficient permissions".to_string(),
//         ))
//     } else {
//         Err(AppError::Unauthorized("User not found".to_string()))
//     }
// }
//
// #[update]
// fn create_role(input: RoleInput) -> RoleIdResult {
//     ensure_permission(EntityPermission::User(vec![]), Permission::Create)?;
//
//     let role_id = get_next_role_id();
//     let role = Role {
//         id: role_id,
//         name: input.name,
//         description: input.description,
//         permissions: vec![], // Initial permissions empty
//     };
//
//     ROLES.with(|roles| {
//         roles.borrow_mut().insert(role_id, role);
//     });
//
//     RoleIdResult::Ok(role_id)
// }
//
// #[update]
// fn add_permission_to_role(
//     role_id: RoleId,
//     entity_permission: EntityPermission,
// ) -> Result<(), AppError> {
//     ensure_permission(EntityPermission::User(vec![]), Permission::Update)?;
//
//     ROLES.with(|roles| {
//         let mut roles = roles.borrow_mut();
//         if let Some(role) = roles.get_mut(&role_id) {
//             role.permissions.push(entity_permission);
//             Ok(())
//         } else {
//             Err(AppError::EntityNotFound("Role not found".to_string()))
//         }
//     })
// }
//
// #[update]
// fn assign_role_to_user(user_id: Principal, role_id: RoleId) -> Result<(), AppError> {
//     ensure_permission(EntityPermission::User(vec![]), Permission::Update)?;
//
//     ROLES.with(|roles| {
//         let roles = roles.borrow();
//         if let Some(role) = roles.get(&role_id) {
//             USERS.with(|users| {
//                 let mut users = users.borrow_mut();
//                 if let Some(user) = users.get_mut(&user_id) {
//                     user.roles.push(role.clone());
//                     Ok(())
//                 } else {
//                     Err(AppError::EntityNotFound("User not found".to_string()))
//                 }
//             })
//         } else {
//             Err(AppError::EntityNotFound("Role not found".to_string()))
//         }
//     })
// }
//
// #[query]
// fn get_role(role_id: RoleId) -> Result<Role, AppError> {
//     ensure_permission(EntityPermission::User(vec![]), Permission::Read)?;
//
//     ROLES.with(|roles| {
//         roles
//             .borrow()
//             .get(&role_id)
//             .cloned()
//             .ok_or(AppError::EntityNotFound("Role not found".to_string()))
//     })
// }
