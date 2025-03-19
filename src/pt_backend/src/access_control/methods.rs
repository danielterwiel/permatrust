use super::state;
use super::*;
use shared::utils::pagination::paginate;
use strum::IntoEnumIterator;

use shared::types::access_control::{
    AssignRolesInput, AssignRolesResult, CreateRoleResult, GetPermissionsResult,
    GetProjectRolesInput, GetProjectRolesResult, GetUserRolesResult, ListProjectMembersRolesInput,
    ListProjectMembersRolesResult, UpdateRolePermissionsInput, UpdateRolePermissionsResult,
    UserWithRoles,
};
use shared::types::users::{GetUserResult, UserIdInput};

#[ic_cdk_macros::update]
pub fn create_role(input: RoleInput) -> CreateRoleResult {
    let role_id = state::get_next_id();
    let role = Role {
        id: role_id,
        name: input.name,
        description: input.description,
        permissions: input.permissions,
        project_id: input.project_id,
        created_at: ic_cdk::api::time(),
        updated_at: None,
    };

    state::insert_role(role_id, role);
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
    let user_permissions = UserPermission::iter().map(Permission::User);
    let document_permissions = DocumentPermission::iter().map(Permission::Document);
    let revision_permissions = RevisionPermission::iter().map(Permission::Revision);
    let organization_permissions = OrganizationPermission::iter().map(Permission::Organization);
    let project_permissions = ProjectPermission::iter().map(Permission::Project);
    let workflow_permissions = WorkflowPermission::iter().map(Permission::Workflow);

    let all_permissions = user_permissions
        .chain(document_permissions)
        .chain(revision_permissions)
        .chain(organization_permissions)
        .chain(project_permissions)
        .chain(workflow_permissions)
        .collect();

    GetPermissionsResult::Ok(all_permissions)
}

#[ic_cdk_macros::query]
pub fn get_user_roles(input: UserIdInput) -> GetUserRolesResult {
    let user_role_ids = match state::get_user_role_ids(&input.id) {
        Some(ids) => ids,
        None => {
            return GetUserRolesResult::Err(AppError::EntityNotFound(
                "User roles not found".to_string(),
            ))
        }
    };

    let roles: Vec<Role> = user_role_ids.0.iter().filter_map(state::get_role).collect();
    GetUserRolesResult::Ok(roles)
}

#[ic_cdk_macros::query]
pub fn get_project_roles(input: GetProjectRolesInput) -> GetProjectRolesResult {
    GetProjectRolesResult::Ok(state::get_roles_by_project(input.project_id))
}

#[ic_cdk_macros::update]
pub fn assign_roles(input: AssignRolesInput) -> AssignRolesResult {
    if !input
        .role_ids
        .iter()
        .all(|role_id| state::get_role(role_id).is_some())
    {
        return AssignRolesResult::Err(AppError::EntityNotFound("Role not found".to_string()));
    }

    for user_id in input.user_ids {
        state::insert_user_roles(user_id, RoleIdVec(input.role_ids.clone()));
    }

    AssignRolesResult::Ok
}

#[ic_cdk_macros::update]
pub fn update_role_permissions(input: UpdateRolePermissionsInput) -> UpdateRolePermissionsResult {
    let mut role = match state::get_role(&input.role_id) {
        Some(role) => role,
        None => {
            return UpdateRolePermissionsResult::Err(AppError::EntityNotFound(
                "Role not found".to_string(),
            ))
        }
    };

    role.permissions = input.permissions;
    role.updated_at = Some(ic_cdk::api::time());
    state::update_role(input.role_id, role);

    UpdateRolePermissionsResult::Ok
}

#[ic_cdk_macros::query]
pub fn list_project_members_roles(
    input: ListProjectMembersRolesInput,
) -> ListProjectMembersRolesResult {
    let project = match crate::projects::state::get_by_id(input.project_id) {
        Some(p) => p,
        None => {
            return ListProjectMembersRolesResult::Err(AppError::EntityNotFound(
                "Project not found".to_string(),
            ))
        }
    };

    let mut users_with_roles: Vec<UserWithRoles> = Vec::new();

    for user_id in &project.members {
        match crate::users::get_user_by_id(*user_id) {
            GetUserResult::Ok(user) => match get_user_roles(UserIdInput { id: *user_id }) {
                GetUserRolesResult::Ok(roles) => {
                    let project_roles: Vec<Role> = roles
                        .into_iter()
                        .filter(|role| role.project_id == input.project_id)
                        .collect();

                    users_with_roles.push(UserWithRoles {
                        user,
                        roles: project_roles,
                    });
                }
                GetUserRolesResult::Err(e) => {
                    ic_cdk::api::print(format!(
                        "Failed to get roles for user {}: {:?}",
                        user_id, e
                    ));
                    continue;
                }
            },
            GetUserResult::Err(e) => {
                ic_cdk::api::print(format!("Failed to deserialize user {}: {:?}", user_id, e));
                continue;
            }
        }
    }

    if users_with_roles.is_empty() {
        return ListProjectMembersRolesResult::Err(AppError::EntityNotFound(
            "No valid users found in project".to_string(),
        ));
    }

    match paginate(
        &users_with_roles,
        input.pagination.page_size,
        input.pagination.page_number,
        input.pagination.filters,
        input.pagination.sort,
    ) {
        Ok(result) => ListProjectMembersRolesResult::Ok(result),
        Err(e) => ListProjectMembersRolesResult::Err(e),
    }
}

pub fn init_default_roles() {
    let permissions = match get_permissions() {
        GetPermissionsResult::Ok(perms) => perms,
        GetPermissionsResult::Err(_) => ic_cdk::trap("Failed to initialize permissions"),
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

    let _ = create_role(admin_role);
    let _ = create_role(editor_role);
    let _ = create_role(viewer_role);
}
