use crate::types::errors::AppError;
use crate::types::projects::ProjectId;
use candid::CandidType;
use serde::Deserialize;
use strum_macros::EnumIter;

use super::users::UserId;

pub type RoleId = u64;

#[derive(Clone, Debug)]
pub struct RoleIdVec(pub Vec<RoleId>);

#[derive(CandidType, Deserialize)]
pub enum RoleIdResult {
    Ok(RoleId),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, EnumIter)]
pub enum UserPermission {
    Read,
    Update,
    Delete,
    Invite,
    Deactivate,
    ChangeRole,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, EnumIter)]
pub enum DocumentPermission {
    Read,
    Create,
    Update,
    Delete,
    Archive,
    Share,
    Export,
    Comment,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, EnumIter)]
pub enum RevisionPermission {
    Read,
    Create,
    Approve,
    Reject,
    Rollback,
    Compare,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, EnumIter)]
pub enum OrganizationPermission {
    Read,
    Create,
    Update,
    Delete,
    ManageMembers,
    ManageBilling,
    ConfigureSettings,
    ViewAuditLogs,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, EnumIter)]
pub enum ProjectPermission {
    Read,
    Create,
    Update,
    Delete,
    Archive,
    ManageMembers,
    ConfigureSettings,
    AssignMembers,
    ManageSettings,
    ViewMetrics,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, EnumIter)]
pub enum WorkflowPermission {
    Read,
    Create,
    Update,
    Delete,
    Execute,
    Pause,
    Resume,
    ViewHistory,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum Permission {
    User(UserPermission),
    Document(DocumentPermission),
    Revision(RevisionPermission),
    Organization(OrganizationPermission),
    Project(ProjectPermission),
    Workflow(WorkflowPermission),
}

#[derive(CandidType, Deserialize)]
pub struct PermissionsResult {
    pub user: Vec<String>,
    pub document: Vec<String>,
    pub revision: Vec<String>,
    pub organization: Vec<String>,
    pub project: Vec<String>,
    pub workflow: Vec<String>,
}

#[derive(CandidType, Deserialize)]
pub struct RoleInput {
    pub name: String,
    pub description: Option<String>,
    pub permissions: Vec<Permission>,
    pub project_id: ProjectId,
}

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub struct Role {
    pub id: RoleId,
    pub permissions: Vec<Permission>,
    pub project_id: ProjectId,
    pub name: String,
    pub description: Option<String>,
    pub created_at: u64,
    pub updated_at: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub struct AssignRolesInput {
    pub role_ids: Vec<RoleId>,
    pub user_ids: Vec<UserId>,
}
