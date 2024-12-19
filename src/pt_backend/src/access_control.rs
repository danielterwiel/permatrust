use ic_cdk_macros::{query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::types::access_control::{
    DocumentPermission, OrganizationPermission, Permission, ProjectPermission, RevisionPermission,
    Role, RoleId, RoleIdVec, RoleInput, UserPermission, WorkflowPermission,
};
use shared::types::errors::AppError;
use shared::types::users::UserId;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU64, Ordering};
use strum::IntoEnumIterator;

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static ROLES: RefCell<StableBTreeMap<RoleId, Role, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))),
        )
    );

static USER_ROLES: RefCell<StableBTreeMap<UserId, RoleIdVec, Memory>> = RefCell::new(
    StableBTreeMap::init(
        MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7))),
    )
);

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
                    .0 // Access the inner Vec<RoleId>
                    .iter()
                    .filter_map(|role_id| ROLES.with(|roles| roles.borrow().get(role_id)))
                    .collect()
            })
        })
    }

    pub fn update_role_permissions_internal(
        role_id: RoleId,
        permissions: Vec<Permission>,
    ) -> Result<(), AppError> {
        ROLES.with(|roles| {
            let mut roles = roles.borrow_mut();
            if let Some(mut role) = roles.get(&role_id) {
                role.permissions = permissions;
                role.updated_at = Some(ic_cdk::api::time());
                roles.insert(role_id, role);
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
                .iter()
                .all(|(role_id, _)| roles.borrow().contains_key(&role_id))
        }) {
            return Err(AppError::EntityNotFound("Role not found".to_string()));
        }
        USER_ROLES.with(|user_roles| user_roles.borrow_mut().insert(user, RoleIdVec(roles)));
        Ok(())
    }

    pub fn initialize_default_roles() -> Result<(), AppError> {
        let admin_permissions = vec![
            Permission::User(UserPermission::Read),
            Permission::User(UserPermission::Update),
            Permission::User(UserPermission::Delete),
            Permission::User(UserPermission::Invite),
            Permission::User(UserPermission::ChangeRole),
        ];
        let editor_permissions = vec![
            Permission::Document(DocumentPermission::Read),
            Permission::Document(DocumentPermission::Create),
            Permission::Document(DocumentPermission::Update),
            Permission::Document(DocumentPermission::Comment),
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
            .ok_or(AppError::EntityNotFound("Role not found".to_string()))
    })
}

#[query]
fn get_permissions() -> Result<Vec<Permission>, AppError> {
    let user_permissions: Vec<Permission> = UserPermission::iter().map(Permission::User).collect();

    let document_permissions: Vec<Permission> = DocumentPermission::iter()
        .map(Permission::Document)
        .collect();

    let revision_permissions: Vec<Permission> = RevisionPermission::iter()
        .map(Permission::Revision)
        .collect();

    let organization_permissions: Vec<Permission> = OrganizationPermission::iter()
        .map(Permission::Organization)
        .collect();

    let project_permissions: Vec<Permission> =
        ProjectPermission::iter().map(Permission::Project).collect();

    let workflow_permissions: Vec<Permission> = WorkflowPermission::iter()
        .map(Permission::Workflow)
        .collect();

    let all_permissions = user_permissions
        .into_iter()
        .chain(document_permissions)
        .chain(revision_permissions)
        .chain(organization_permissions)
        .chain(project_permissions)
        .chain(workflow_permissions)
        .collect();

    Ok(all_permissions)
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
            .iter()
            .filter(|(_, role)| role.project_id == project_id)
            .map(|(_, role)| role.clone())
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
fn update_role_permissions(role_id: RoleId, permissions: Vec<Permission>) -> Result<(), AppError> {
    access_control_utils::update_role_permissions_internal(role_id, permissions)
}

#[query]
fn get_user_permissions(user: UserId) -> Option<Vec<Permission>> {
    access_control_utils::get_user_roles_internal(&user).map(|roles| {
        roles
            .iter()
            .flat_map(|role| role.permissions.clone())
            .collect()
    })
}
