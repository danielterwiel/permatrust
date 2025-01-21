use super::state;
use super::*;
use crate::users::{get_user_by_id, get_user_by_principal};

use shared::types::entities::Entity;
use shared::types::pagination::{FilterCriteria, FilterField, FilterOperator, ProjectFilterField};
use shared::types::users::User;
use shared::utils::filter::filter;
use shared::utils::pagination::paginate;

use crate::logger::{log_info, loggable_project};

#[ic_cdk_macros::update]
pub fn create_project(
    organization_id: OrganizationId,
    name: String,
) -> Result<ProjectId, AppError> {
    if name.trim().is_empty() {
        return Err(AppError::InternalError(
            "Project name cannot be empty".to_string(),
        ));
    }

    let caller = ic_cdk::caller();
    let user = get_user_by_principal(caller)?;
    let id = state::get_next_id();

    let project = Project {
        id,
        name,
        members: vec![user.id],
        organizations: vec![organization_id],
        created_at: ic_cdk::api::time(),
        created_by: user.id,
        documents: vec![],
    };

    state::insert(id, project.clone());
    log_info("create_project", loggable_project(&project));

    Ok(id)
}

#[ic_cdk_macros::query]
pub fn get_projects() -> Result<Vec<Project>, AppError> {
    let caller = ic_cdk::caller();
    let user = get_user_by_principal(caller)?;

    let filter_criteria = FilterCriteria {
        field: FilterField::Project(ProjectFilterField::Members),
        entity: Entity::Project,
        value: user.id.to_string(),
        operator: FilterOperator::Contains,
    };

    let projects = state::get_all();
    let projects = filter(&projects, vec![filter_criteria]);

    Ok(projects)
}

#[ic_cdk_macros::query]
pub fn list_projects(
    pagination: PaginationInput,
) -> Result<(Vec<Project>, PaginationMetadata), AppError> {
    let projects = get_projects()?;
    paginate(
        &projects,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[ic_cdk_macros::query]
pub fn list_projects_by_organization_id(
    organization_id: OrganizationId,
    pagination: PaginationInput,
) -> Result<(Vec<Project>, PaginationMetadata), AppError> {
    let projects = state::get_by_organization_id(organization_id);
    paginate(
        &projects,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[ic_cdk_macros::query]
pub fn list_project_members(
    project_id: ProjectId,
    pagination: PaginationInput,
) -> Result<(Vec<User>, PaginationMetadata), AppError> {
    let project = state::get_by_id(project_id)
        .ok_or_else(|| AppError::EntityNotFound("Project not found".to_string()))?;

    let users = project
        .members
        .into_iter()
        .map(|user_id| get_user_by_id(user_id).expect("User not found"))
        .collect::<Vec<_>>();

    paginate(
        &users,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[ic_cdk_macros::query]
pub fn get_project(project_id: ProjectId) -> ProjectResult {
    match state::get_by_id(project_id) {
        Some(project) => ProjectResult::Ok(project),
        None => ProjectResult::Err(AppError::EntityNotFound("Project not found".to_string())),
    }
}
