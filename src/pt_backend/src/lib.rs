use shared::types::documents::{
    DocumentId, DocumentIdResult, DocumentResult, PaginatedDocumentsResult,
};
use shared::types::organisations::{
    OrganisationId, OrganisationIdResult, OrganisationResult, PaginatedOrganisationsResult,
};
use shared::types::pagination::PaginationInput;
use shared::types::projects::{PaginatedProjectsResult, ProjectId, ProjectIdResult, ProjectResult};
use shared::types::revisions::{
    PaginatedRevisionsResult, RevisionId, RevisionIdResult, RevisionResult, RevisionsResult,
};
use shared::types::users::{PaginatedUsersResult, UserId, UserIdResult, UserResult};
use shared::types::workflows::{
    CreateWorkflowInput, EventId, PaginatedWorkflowsResult, StateId, WorkflowGraph, WorkflowId,
    WorkflowIdResult, WorkflowResult,
};

// init
mod init;

// utils
mod logger;

// entities
mod access_control;
mod documents;
mod organisations;
mod projects;
mod revisions;
mod users;
mod workflows;

ic_cdk::export_candid!();
