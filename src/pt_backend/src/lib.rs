use shared::types::access_control::{
    AssignRolesInput, Permission, Role, RoleId, RoleInput, UserWithRoles,
};
use shared::types::documents::{Document, DocumentId};
use shared::types::errors::AppError;
use shared::types::organizations::{Organization, OrganizationId, OrganizationResult};
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::projects::{Project, ProjectId, ProjectResult};
use shared::types::revisions::{Revision, RevisionId};
use shared::types::users::{CreateUserInput, User, UserId};
use shared::types::workflows::{
    CreateWorkflowInput, EventId, PaginatedWorkflowsResult, StateId, Workflow, WorkflowGraph,
    WorkflowId,
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
