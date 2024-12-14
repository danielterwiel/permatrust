use ic_cdk_macros::{query, update};
use shared::types::access_control::{
    DocumentPermission, EntityPermission, EntityPermissionsResult, OrganizationPermission,
    ProjectPermission, RevisionPermission, Role, RoleId, RoleInput, UserPermission,
    WorkflowPermission,
};
use shared::types::errors::AppError;
use shared::types::users::UserId;
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use strum::IntoEnumIterator;

thread_local! {
    static ROLES: RefCell<HashMap<RoleId, Role>> = RefCell::new(HashMap::new());
    static USER_ROLES: RefCell<HashMap<UserId, Vec<RoleId>>> = RefCell::new(HashMap::new());
    static NEXT_ACCESS_CONTROL_ID: AtomicU64 = AtomicU64::new(0);
}

mod access_control_utils {
    use super::*;

    pub fn get_next_id() -> RoleId {
        NEXT_ACCESS_CONTROL_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
    }

    pub fn create_role_internal(input: RoleInput) -> Result<RoleId, AppError> {
        let role_id = get_next_id();
        let role = Role {
            id: role_id,
            name: input.name,
            description: input.description,
            permissions: input.permissions,
            project_id: input.project_id,
            created_at: ic_cdk::api::time(),
            updated_at: None,
        };

        ROLES.with(|roles| roles.borrow_mut().insert(role_id, role));
        Ok(role_id)
    }

    pub fn get_user_roles_internal(user_id: &UserId) -> Option<Vec<Role>> {
        USER_ROLES.with(|user_roles| {
            user_roles.borrow().get(user_id).map(|role_ids| {
                role_ids
                    .iter()
                    .filter_map(|role_id| ROLES.with(|roles| roles.borrow().get(role_id).cloned()))
                    .collect()
            })
        })
    }

    pub fn update_role_permissions_internal(
        role_id: RoleId,
        permissions: Vec<EntityPermission>,
    ) -> Result<(), AppError> {
        ROLES.with(|roles| {
            if let Some(role) = roles.borrow_mut().get_mut(&role_id) {
                role.permissions = permissions;
                role.updated_at = Some(ic_cdk::api::time());
                Ok(())
            } else {
                Err(AppError::EntityNotFound("Role not found".to_string()))
            }
        })
    }

    pub fn assign_roles_internal(user: UserId, roles: Vec<RoleId>) -> Result<(), AppError> {
        if !ROLES.with(|roles| {
            roles
                .borrow()
                .keys()
                .all(|role_id| roles.borrow().contains_key(role_id))
        }) {
            return Err(AppError::EntityNotFound("Role not found".to_string()));
        }
        USER_ROLES.with(|user_roles| user_roles.borrow_mut().insert(user, roles));
        Ok(())
    }

    pub fn initialize_default_roles() -> Result<(), AppError> {
        let admin_permissions = vec![
            EntityPermission::User(UserPermission::Read),
            EntityPermission::User(UserPermission::Update),
            EntityPermission::User(UserPermission::Delete),
            EntityPermission::User(UserPermission::Invite),
            EntityPermission::User(UserPermission::ChangeRole),
        ];
        let editor_permissions = vec![
            EntityPermission::Document(DocumentPermission::Read),
            EntityPermission::Document(DocumentPermission::Create),
            EntityPermission::Document(DocumentPermission::Update),
            EntityPermission::Document(DocumentPermission::Comment),
        ];

        create_role_internal(RoleInput {
            name: "Admin".to_string(),
            description: Some("Full system access".to_string()),
            permissions: admin_permissions,
            project_id: 0,
        })?;

        create_role_internal(RoleInput {
            name: "Editor".to_string(),
            description: Some("Can manage content".to_string()),
            permissions: editor_permissions,
            project_id: 0,
        })?;

        Ok(())
    }
}

pub fn init_default_roles() {
    access_control_utils::initialize_default_roles().unwrap();
}

#[query]
fn get_role(role_id: RoleId) -> Result<Role, AppError> {
    ROLES.with(|roles| {
        roles
            .borrow()
            .get(&role_id)
            .cloned()
            .ok_or(AppError::EntityNotFound("Role not found".to_string()))
    })
}

#[query]
fn get_permissions() -> Result<EntityPermissionsResult, AppError> {
    Ok(EntityPermissionsResult {
        user: UserPermission::iter()
            .map(|action| format!("{:?}", action))
            .collect(),
        document: DocumentPermission::iter()
            .map(|action| format!("{:?}", action))
            .collect(),
        revision: RevisionPermission::iter()
            .map(|action| format!("{:?}", action))
            .collect(),
        organization: OrganizationPermission::iter()
            .map(|action| format!("{:?}", action))
            .collect(),
        project: ProjectPermission::iter()
            .map(|action| format!("{:?}", action))
            .collect(),
        workflow: WorkflowPermission::iter()
            .map(|action| format!("{:?}", action))
            .collect(),
    })
}

#[query]
fn get_user_roles(user_id: UserId) -> Result<Vec<Role>, AppError> {
    match access_control_utils::get_user_roles_internal(&user_id) {
        Some(roles) => Ok(roles),
        None => Err(AppError::EntityNotFound("User roles not found".to_string())),
    }
}

#[query]
fn get_project_roles(project_id: u32) -> Result<Vec<Role>, AppError> {
    let roles = ROLES.with(|roles| {
        roles
            .borrow()
            .values()
            .filter(|role| role.project_id == project_id)
            .cloned()
            .collect()
    });
    Ok(roles)
}

#[update]
fn create_role(input: RoleInput) -> Result<RoleId, AppError> {
    access_control_utils::create_role_internal(input)
}

#[update]
fn assign_roles(user: UserId, role_ids: Vec<RoleId>) -> Result<(), AppError> {
    access_control_utils::assign_roles_internal(user, role_ids)
}

#[update]
fn update_role_permissions(
    role_id: RoleId,
    permissions: Vec<EntityPermission>,
) -> Result<(), AppError> {
    access_control_utils::update_role_permissions_internal(role_id, permissions)
}

#[query]
fn get_user_permissions(user: UserId) -> Option<Vec<EntityPermission>> {
    access_control_utils::get_user_roles_internal(&user).map(|roles| {
        roles
            .iter()
            .flat_map(|role| role.permissions.clone())
            .collect()
    })
}
