use shared::types::access_control::{
    AssignRolesInput, AssignRolesResult, CreateRoleResult, GetPermissionsResult,
    GetProjectRolesInput, GetProjectRolesResult, GetRoleResult, GetUserPermissionsResult,
    GetUserRolesResult, ListProjectMembersRolesResult, RoleIdInput, RoleInput,
    UpdateRolePermissionsInput, UpdateRolePermissionsResult,
};
use shared::types::documents::{
    CreateDocumentInput, CreateDocumentResult, DocumentIdInput, GetDocumentResult,
    ListDocumentsByProjectIdInput, ListDocumentsByProjectIdResult, ListDocumentsInput,
    ListDocumentsResult,
};
use shared::types::organizations::{
    CreateOrganizationInput, CreateOrganizationResult, GetOrganizationResult,
    ListOrganizationsResult, OrganizationIdInput,
};

use shared::types::pagination::PaginationInput;
use shared::types::projects::{
    CreateProjectInput, CreateProjectResult, GetProjectsResult, ListProjectMembersInput,
    ListProjectMembersResult, ListProjectsByOrganizationIdInput, ListProjectsByOrganizationResult,
    ListProjectsResult, ProjectIdInput, ProjectResult,
};
use shared::types::revisions::{
    CreateRevisionInput, CreateRevisionResult, DiffRevisionsInput, DiffRevisionsResult,
    GetRevisionResult, ListRevisionsByDocumentIdInput, ListRevisionsInput, ListRevisionsResult,
    RevisionIdInput,
};
use shared::types::users::{
    CreateUserInput, CreateUserResult, GetUserResult, ListProjectMembersRolesInput, ListUsersInput,
    ListUsersResult, UserIdInput,
};
use shared::types::workflows::{
    CreateWorkflowInput, CreateWorkflowResult, ExecuteWorkflowInput, ExecuteWorkflowResult,
    GetWorkflowDefinitionResult, GetWorkflowResult, GetWorkflowStateResult, ListWorkflowsResult,
    WorkflowIdInput,
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
