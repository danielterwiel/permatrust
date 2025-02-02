use super::state;
use super::*;
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::projects::ProjectId;
use shared::utils::pagination::paginate;
use strum::IntoEnumIterator;

use shared::types::access_control::{AssignRolesInput, UserWithRoles};

#[ic_cdk_macros::update]
pub fn create_role(input: RoleInput) -> Result<RoleId, AppError> {
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
    Ok(role_id)
}

#[ic_cdk_macros::query]
pub fn get_role(role_id: RoleId) -> Result<Role, AppError> {
    state::get_role(&role_id).ok_or(AppError::EntityNotFound("Role not found".to_string()))
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
pub fn get_permissions() -> Result<Vec<Permission>, AppError> {
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

    Ok(all_permissions)
}

#[ic_cdk_macros::query]
pub fn get_user_roles(user_id: UserId) -> Result<Vec<Role>, AppError> {
    let user_role_ids = state::get_user_role_ids(&user_id)
        .ok_or_else(|| AppError::EntityNotFound("User roles not found".to_string()))?;

    let roles: Vec<Role> = user_role_ids.0.iter().filter_map(state::get_role).collect();

    Ok(roles)
}

#[ic_cdk_macros::query]
pub fn get_project_roles(project_id: u32) -> Result<Vec<Role>, AppError> {
    Ok(state::get_roles_by_project(project_id))
}

#[ic_cdk_macros::update]
pub fn assign_roles(input: AssignRolesInput) -> Result<(), AppError> {
    if !input
        .role_ids
        .iter()
        .all(|role_id| state::get_role(role_id).is_some())
    {
        return Err(AppError::EntityNotFound("Role not found".to_string()));
    }

    for user_id in input.user_ids {
        state::insert_user_roles(user_id, RoleIdVec(input.role_ids.clone()));
    }

    Ok(())
}

#[ic_cdk_macros::update]
pub fn update_role_permissions(
    role_id: RoleId,
    permissions: Vec<Permission>,
) -> Result<(), AppError> {
    let mut role =
        state::get_role(&role_id).ok_or(AppError::EntityNotFound("Role not found".to_string()))?;

    role.permissions = permissions;
    role.updated_at = Some(ic_cdk::api::time());
    state::update_role(role_id, role);

    Ok(())
}

#[ic_cdk_macros::query]
pub fn get_user_permissions(user: UserId) -> Option<Vec<Permission>> {
    get_user_roles(user).ok().map(|roles| {
        roles
            .iter()
            .flat_map(|role| role.permissions.clone())
            .collect()
    })
}

#[ic_cdk_macros::query]
pub fn list_project_members_roles(
    project_id: ProjectId,
    pagination: PaginationInput,
) -> Result<(Vec<UserWithRoles>, PaginationMetadata), AppError> {
    let project = crate::projects::state::get_by_id(project_id)
        .ok_or_else(|| AppError::EntityNotFound("Project not found".to_string()))?;

    let mut users_with_roles: Vec<UserWithRoles> = Vec::new();

    for user_id in &project.members {
        match crate::users::get_user_by_id(*user_id) {
            Ok(user) => match get_user_roles(*user_id) {
                Ok(roles) => {
                    let project_roles: Vec<Role> = roles
                        .into_iter()
                        .filter(|role| role.project_id == project_id)
                        .collect();

                    users_with_roles.push(UserWithRoles {
                        user,
                        roles: project_roles,
                    });
                }
                Err(e) => {
                    ic_cdk::api::print(format!(
                        "Failed to get roles for user {}: {:?}",
                        user_id, e
                    ));
                    continue;
                }
            },
            Err(e) => {
                ic_cdk::api::print(format!("Failed to deserialize user {}: {:?}", user_id, e));
                continue;
            }
        }
    }

    if users_with_roles.is_empty() {
        return Err(AppError::EntityNotFound(
            "No valid users found in project".to_string(),
        ));
    }

    paginate(
        &users_with_roles,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

pub fn init_default_roles() {
    let all_permissions = get_permissions().expect("Failed to get permissions");
    let admin_role = RoleInput {
        name: "Admin".to_string(),
        description: Some("Full system access".to_string()),
        permissions: all_permissions,
        project_id: 0, // TODO: add entries on every project creation
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
        project_id: 0, // TODO: add entries on every project creation
    };

    let viewer_role = RoleInput {
        name: "Viewer".to_string(),
        description: Some("Read-only access".to_string()),
        permissions: get_all_read_permissions(),
        project_id: 0, // TODO: add entries on every project creation
    };

    let _ = create_role(admin_role);
    let _ = create_role(editor_role);
    let _ = create_role(viewer_role);
}
