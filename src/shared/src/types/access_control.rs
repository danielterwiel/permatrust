use crate::types::errors::AppError;
use crate::types::projects::ProjectId;
use crate::types::users::User;
use candid::CandidType;
use serde::Deserialize;
use strum_macros::EnumIter;

use super::pagination::PaginationMetadata;
use super::users::UserId;

pub type RoleId = u64;

#[derive(candid::CandidType, serde::Deserialize)]
pub struct RoleIdInput {
    pub id: RoleId,
}

#[derive(Clone, Debug)]
pub struct RoleIdVec(pub Vec<RoleId>);

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
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UserWithRoles {
    pub user: User,
    pub roles: Vec<Role>,
}

// Inputs

#[derive(CandidType, Deserialize)]
pub struct UpdateRolePermissionsInput {
    pub role_id: RoleId,
    pub permissions: Vec<Permission>,
}

#[derive(CandidType, Deserialize)]
pub struct AssignRolesInput {
    pub role_ids: Vec<RoleId>,
    pub user_ids: Vec<UserId>,
}

#[derive(CandidType, Deserialize)]
pub struct RoleInput {
    pub name: String,
    pub description: Option<String>,
    pub permissions: Vec<Permission>,
    pub project_id: ProjectId,
}

#[derive(CandidType, Deserialize)]
pub struct GetProjectRolesInput {
    pub project_id: u32,
}

// Results

// Result enums placed at the bottom as requested
#[derive(CandidType, Deserialize)]
pub enum CreateRoleResult {
    Ok(RoleId),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum AssignRolesResult {
    Ok,
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetRoleResult {
    Ok(Role),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetPermissionsResult {
    Ok(Vec<Permission>),
    Err(AppError),
}
impl GetPermissionsResult {
    pub fn expect(&self, _arg: &str) -> Vec<Permission> {
        todo!()
    }
}

#[derive(CandidType, Deserialize)]
pub enum GetUserRolesResult {
    Ok(Vec<Role>),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetProjectRolesResult {
    Ok(Vec<Role>),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum UpdateRolePermissionsResult {
    Ok,
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetUserPermissionsResult {
    Ok(Vec<Permission>),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ListProjectMembersRolesResult {
    Ok((Vec<UserWithRoles>, PaginationMetadata)),
    Err(AppError),
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
