use candid::CandidType;
use serde::Deserialize;

use crate::types::entities::Entity;
use crate::types::errors::AppError;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum UserFilterField {
    FirstName,
    LastName,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum DocumentFilterField {
    ProjectId,
    Version,
    Title,
    CreatedAt,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum RevisionFilterField {
    ProjectId,
    Version,
    DocumentId,
    CreatedAt,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum OrganizationFilterField {
    Name,
    CreatedAt,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum ProjectFilterField {
    OrganizationId,
    Name,
    CreatedAt,
    CreatedBy,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum WorkflowFilterField {
    Name,
    ProjectId,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum FilterField {
    User(UserFilterField),
    Document(DocumentFilterField),
    Revision(RevisionFilterField),
    Organization(OrganizationFilterField),
    Project(ProjectFilterField),
    Workflow(WorkflowFilterField),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum FilterOperator {
    Contains,
    GreaterThan,
    LessThan,
    Equals,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct FilterCriteria {
    pub field: FilterField,
    pub entity: Entity,
    pub value: String,
    pub operator: FilterOperator,
}
pub type Filters = Option<Vec<FilterCriteria>>;
pub type PageSize = u8;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum SortOrder {
    Asc,
    Desc,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct SortCriteria {
    pub field: FilterField,
    pub order: SortOrder,
}
// pub type Sort = Option<SortCriteria>;
pub type PageNumber = u8;

#[derive(CandidType, Deserialize)]
pub struct PaginationInput {
    pub filters: Filters,
    pub page_size: PageSize,
    pub sort: Option<SortCriteria>,
    pub page_number: PageNumber,
}
pub type TotalPages = u8;
pub type TotalItems = u8;

#[derive(CandidType, Deserialize)]
pub struct PaginationMetadata {
    pub page_size: PageSize,
    pub total_pages: TotalPages,
    pub total_items: TotalItems,
    pub has_previous_page: bool,
    pub has_next_page: bool,
    pub page_number: PageNumber,
}

#[derive(CandidType, Deserialize)]
pub enum PaginatedResult<T> {
    Ok(Vec<T>, PaginationMetadata),
    Err(AppError),
}
