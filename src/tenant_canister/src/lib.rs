use shared::types::access_control::{
    AssignRolesInput, AssignRolesResult, CreateRoleResult, GetPermissionsResult,
    GetProjectRolesInput, GetProjectRolesResult, RoleInput, UpdateRolePermissionsInput,
    UpdateRolePermissionsResult,
};
use shared::types::documents::{
    CreateDocumentInput, CreateDocumentResult, ListDocumentsInput, ListDocumentsResult,
};
use shared::types::invites::{CreateInviteResult, GetInviteResult, ListInvitesResult};
use shared::types::logs::{ListLogsInput, ListLogsResult};
use shared::types::management::{CreateInitTenantCanisterInput, UpgradeCanisterResult};
use shared::types::organization::{
    CreateOrganizationInput, CreateOrganizationResult, GetOrganizationResult,
};
use shared::types::pagination::PaginationInput;
use shared::types::projects::{
    CreateProjectInput, CreateProjectResult, ListProjectMembersInput, ListProjectMembersResult,
    ListProjectsResult,
};
use shared::types::revisions::{
    CreateRevisionInput, CreateRevisionResult, DiffRevisionsInput, DiffRevisionsResult,
    ListRevisionsInput, ListRevisionsResult,
};
use shared::types::users::{
    CreateUserInput, CreateUserResult, GetUserResult, ListUsersInput, ListUsersResult,
};
use shared::types::workflows::{
    CreateWorkflowInput, CreateWorkflowResult, ExecuteWorkflowInput, ExecuteWorkflowResult,
    GetWorkflowDefinitionResult, GetWorkflowStateResult, ListWorkflowsResult, WorkflowIdInput,
};

// environment
mod env;

// init
mod init;

// utils - using shared logging system

// entities
mod access_control;
mod documents;
mod invites;
mod logs;
mod management;
mod organization;
mod projects;
mod revisions;
mod users;
mod workflows;

ic_cdk::export_candid!();
