use super::state;
use super::*;
use shared::{log_debug, log_error, log_info, log_warn};
use strum::IntoEnumIterator;

use shared::types::access_control::{
    AssignRolesInput, AssignRolesResult, CreateRoleResult, GetPermissionsResult,
    GetProjectRolesInput, GetProjectRolesResult, UpdateRolePermissionsInput,
    UpdateRolePermissionsResult,
};

#[ic_cdk_macros::update]
pub fn create_role(input: RoleInput) -> CreateRoleResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Role creation attempt [principal={}, role_name='{}', project_id={}]",
        principal,
        input.name,
        input.project_id
    );

    // TODO: Add permission validation here when authorization system is implemented
    // log_debug!("access_control: Checking role creation permissions [principal={}, project_id={}]",
    //           principal, input.project_id);

    log_info!(
        "role_creation: Creating role [name='{}', project_id={}, permissions={}, principal={}]",
        input.name,
        input.project_id,
        input.permissions.len(),
        principal
    );

    let role_id = state::get_next_id();
    let role = Role {
        id: role_id,
        name: input.name.clone(),
        description: input.description,
        permissions: input.permissions,
        project_id: input.project_id,
        created_at: ic_cdk::api::time(),
        updated_at: None,
    };

    state::insert_role(role_id, role);
    log_info!(
        "role_creation: Successfully created role [id={}, name='{}', project_id={}, created_by={}]",
        role_id,
        input.name,
        input.project_id,
        principal
    );
    CreateRoleResult::Ok(role_id)
}

pub fn get_all_read_permissions() -> Vec<Permission> {
    vec![
        Permission::User(UserPermission::Read),
        Permission::Document(DocumentPermission::Read),
        Permission::Revision(RevisionPermission::Read),
        Permission::Organization(OrganizationPermission::Read),
        Permission::Project(ProjectPermission::Read),
        Permission::Workflow(WorkflowPermission::Read),
    ]
}

#[ic_cdk_macros::query]
pub fn get_permissions() -> GetPermissionsResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Permissions enumeration attempt [principal={}]",
        principal
    );
    let user_permissions = UserPermission::iter().map(Permission::User);
    let document_permissions = DocumentPermission::iter().map(Permission::Document);
    let revision_permissions = RevisionPermission::iter().map(Permission::Revision);
    let organization_permissions = OrganizationPermission::iter().map(Permission::Organization);
    let project_permissions = ProjectPermission::iter().map(Permission::Project);
    let workflow_permissions = WorkflowPermission::iter().map(Permission::Workflow);

    let all_permissions: Vec<Permission> = user_permissions
        .chain(document_permissions)
        .chain(revision_permissions)
        .chain(organization_permissions)
        .chain(project_permissions)
        .chain(workflow_permissions)
        .collect();

    log_debug!(
        "permissions: Retrieved all permissions [principal={}, count={}]",
        principal,
        all_permissions.len()
    );
    GetPermissionsResult::Ok(all_permissions)
}

#[ic_cdk_macros::query]
pub fn get_project_roles(input: GetProjectRolesInput) -> GetProjectRolesResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Project roles query attempt [principal={}, project_id={}]",
        principal,
        input.project_id
    );

    // TODO: Add permission validation here when authorization system is implemented
    // log_debug!("access_control: Checking project access permissions [principal={}, project_id={}]",
    //           principal, input.project_id);

    let roles = state::get_roles_by_project(input.project_id);
    log_debug!(
        "role_access: Retrieved project roles [principal={}, project_id={}, role_count={}]",
        principal,
        input.project_id,
        roles.len()
    );
    GetProjectRolesResult::Ok(roles)
}

#[ic_cdk_macros::update]
pub fn assign_roles(input: AssignRolesInput) -> AssignRolesResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Role assignment attempt [principal={}, role_ids={:?}, user_ids={:?}]",
        principal,
        input.role_ids,
        input.user_ids
    );

    // TODO: Add permission validation here when authorization system is implemented
    // log_debug!("access_control: Checking role assignment permissions [principal={}, target_users={:?}]",
    //           principal, input.user_ids);

    let roles: Vec<Role> = input.role_ids.iter().filter_map(state::get_role).collect();
    if roles.len() != input.role_ids.len() {
        log_warn!("role_assignment: Role validation failed [principal={}, requested_roles={:?}, found_roles={}]", 
                 principal, input.role_ids, roles.len());
        return AssignRolesResult::Err(AppError::EntityNotFound("Role not found".to_string()));
    }

    let user_ids = input.user_ids.clone();
    log_info!(
        "role_assignment: Assigning roles [principal={}, roles={:?}, users={:?}]",
        principal,
        input.role_ids,
        user_ids
    );

    for user_id in user_ids {
        state::insert_user_roles(user_id, RoleIdVec(input.role_ids.clone()));
        log_info!(
            "role_assignment: Assigned roles to user [principal={}, user_id={}, roles={:?}]",
            principal,
            user_id,
            input.role_ids
        );
    }

    log_info!(
        "role_assignment: Successfully completed role assignment [principal={}, affected_users={}]",
        principal,
        input.user_ids.len()
    );
    AssignRolesResult::Ok
}

#[ic_cdk_macros::update]
pub fn update_role_permissions(input: UpdateRolePermissionsInput) -> UpdateRolePermissionsResult {
    let principal = ic_cdk::api::msg_caller();
    log_debug!(
        "auth_check: Role permission update attempt [principal={}, role_id={}, new_permissions={}]",
        principal,
        input.role_id,
        input.permissions.len()
    );

    // TODO: Add permission validation here when authorization system is implemented
    // log_debug!("access_control: Checking role modification permissions [principal={}, role_id={}]",
    //           principal, input.role_id);

    let mut role = match state::get_role(&input.role_id) {
        Some(role) => {
            log_debug!("role_modification: Found role for update [role_id={}, name='{}', current_permissions={}]", 
                      input.role_id, role.name, role.permissions.len());
            role
        }
        None => {
            log_warn!(
                "role_modification: Role not found for update [principal={}, role_id={}]",
                principal,
                input.role_id
            );
            return UpdateRolePermissionsResult::Err(AppError::EntityNotFound(
                "Role not found".to_string(),
            ));
        }
    };

    let old_permissions_count = role.permissions.len();
    role.permissions = input.permissions;
    role.updated_at = Some(ic_cdk::api::time());
    state::update_role(input.role_id, role.clone());

    log_info!("role_modification: Updated role permissions [principal={}, role_id={}, role_name='{}', old_permissions={}, new_permissions={}]", 
             principal, input.role_id, role.name, old_permissions_count, role.permissions.len());
    UpdateRolePermissionsResult::Ok
}

pub fn init_default_roles() {
    log_info!("role_initialization: Starting default roles initialization");

    let permissions = match get_permissions() {
        GetPermissionsResult::Ok(perms) => {
            log_debug!(
                "role_initialization: Retrieved permissions [count={}]",
                perms.len()
            );
            perms
        }
        GetPermissionsResult::Err(_) => {
            log_error!("role_initialization: Failed to initialize permissions");
            ic_cdk::trap("Failed to initialize permissions")
        }
    };

    let admin_role = RoleInput {
        name: "Admin".to_string(),
        description: Some("Full system access".to_string()),
        permissions,
        project_id: 0,
    };

    let editor_role = RoleInput {
        name: "Editor".to_string(),
        description: Some("Manages the content".to_string()),
        permissions: vec![
            Permission::Document(DocumentPermission::Read),
            Permission::Document(DocumentPermission::Create),
            Permission::Document(DocumentPermission::Update),
            Permission::Document(DocumentPermission::Comment),
        ],
        project_id: 0,
    };

    let viewer_role = RoleInput {
        name: "Viewer".to_string(),
        description: Some("Read-only access".to_string()),
        permissions: get_all_read_permissions(),
        project_id: 0,
    };

    log_debug!("role_initialization: Creating default roles [admin, editor, viewer]");

    match create_role(admin_role) {
        CreateRoleResult::Ok(role_id) => {
            log_info!("role_initialization: Created admin role [id={}]", role_id)
        }
        CreateRoleResult::Err(e) => {
            log_error!("role_initialization: Failed to create admin role - {:?}", e)
        }
    }

    match create_role(editor_role) {
        CreateRoleResult::Ok(role_id) => {
            log_info!("role_initialization: Created editor role [id={}]", role_id)
        }
        CreateRoleResult::Err(e) => log_error!(
            "role_initialization: Failed to create editor role - {:?}",
            e
        ),
    }

    match create_role(viewer_role) {
        CreateRoleResult::Ok(role_id) => {
            log_info!("role_initialization: Created viewer role [id={}]", role_id)
        }
        CreateRoleResult::Err(e) => log_error!(
            "role_initialization: Failed to create viewer role - {:?}",
            e
        ),
    }

    log_info!("role_initialization: Completed default roles initialization");
}
