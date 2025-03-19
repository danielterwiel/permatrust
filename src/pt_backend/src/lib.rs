use shared::types::access_control::{
    AssignRolesInput, AssignRolesResult, CreateRoleResult, GetPermissionsResult,
    GetProjectRolesInput, GetProjectRolesResult, GetUserRolesResult, ListProjectMembersRolesInput,
    ListProjectMembersRolesResult, RoleInput, UpdateRolePermissionsInput,
    UpdateRolePermissionsResult,
};
use shared::types::documents::{
    CreateDocumentInput, CreateDocumentResult, ListDocumentsInput, ListDocumentsResult,
};
use shared::types::organizations::{
    CreateOrganizationInput, CreateOrganizationResult, ListOrganizationsResult,
};

use shared::types::pagination::PaginationInput;
use shared::types::projects::{
    CreateProjectInput, CreateProjectResult, GetProjectsResult, ListProjectMembersInput,
    ListProjectMembersResult, ListProjectsResult,
};
use shared::types::revisions::{
    CreateRevisionInput, CreateRevisionResult, DiffRevisionsInput, DiffRevisionsResult,
    ListRevisionsInput, ListRevisionsResult,
};
use shared::types::users::{
    CreateUserInput, CreateUserResult, GetUserResult, ListUsersInput, ListUsersResult, UserIdInput,
};
use shared::types::workflows::{
    CreateWorkflowInput, CreateWorkflowResult, ExecuteWorkflowInput, ExecuteWorkflowResult,
    GetWorkflowDefinitionResult, GetWorkflowStateResult, ListWorkflowsResult, WorkflowIdInput,
};

// init
mod init;

// utils
mod logger;

// entities
mod access_control;
mod documents;
mod organizations;
mod projects;
mod revisions;
mod users;
mod workflows;

ic_cdk::export_candid!();
