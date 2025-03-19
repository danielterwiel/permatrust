use super::state;
use super::*;
use crate::users::{get_user_by_id, get_user_by_principal};

use shared::types::entities::Entity;
use shared::types::pagination::{FilterCriteria, FilterField, FilterOperator, ProjectFilterField};
use shared::types::projects::{
    CreateProjectInput, CreateProjectResult, GetProjectsResult, ListProjectMembersInput,
    ListProjectMembersResult, ListProjectsResult,
};
use shared::types::users::GetUserResult;
use shared::utils::filter::filter;
use shared::utils::pagination::paginate;

use crate::logger::{log_info, loggable_project};

#[ic_cdk_macros::update]
pub fn create_project(input: CreateProjectInput) -> CreateProjectResult {
    if input.name.trim().is_empty() {
        return CreateProjectResult::Err(AppError::InternalError(
            "Project name cannot be empty".to_string(),
        ));
    }

    let caller = ic_cdk::caller();
    let user = match get_user_by_principal(caller) {
        GetUserResult::Ok(u) => u,
        GetUserResult::Err(e) => return CreateProjectResult::Err(e),
    };

    let id = state::get_next_id();
    let project = Project {
        id,
        name: input.name,
        members: vec![user.id],
        organizations: vec![input.organization_id],
        created_at: ic_cdk::api::time(),
        created_by: user.id,
        documents: vec![],
    };

    state::insert(id, project.clone());
    log_info("create_project", loggable_project(&project));

    CreateProjectResult::Ok(id)
}

#[ic_cdk_macros::query]
pub fn get_projects() -> GetProjectsResult {
    let caller = ic_cdk::caller();
    let user = match get_user_by_principal(caller) {
        GetUserResult::Ok(u) => u,
        GetUserResult::Err(e) => return GetProjectsResult::Err(e),
    };

    let filter_criteria = FilterCriteria {
        field: FilterField::Project(ProjectFilterField::Members),
        entity: Entity::Project,
        value: user.id.to_string(),
        operator: FilterOperator::Contains,
    };

    let projects = state::get_all();
    let projects = filter(&projects, vec![filter_criteria]);

    GetProjectsResult::Ok(projects)
}

#[ic_cdk_macros::query]
pub fn list_projects(pagination: PaginationInput) -> ListProjectsResult {
    let projects = match get_projects() {
        GetProjectsResult::Ok(p) => p,
        GetProjectsResult::Err(e) => return ListProjectsResult::Err(e),
    };

    match paginate(
        &projects,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok(result) => ListProjectsResult::Ok(result),
        Err(e) => ListProjectsResult::Err(e),
    }
}

#[ic_cdk_macros::query]
pub fn list_project_members(input: ListProjectMembersInput) -> ListProjectMembersResult {
    let project = match state::get_by_id(input.project_id) {
        Some(p) => p,
        None => {
            return ListProjectMembersResult::Err(AppError::EntityNotFound(
                "Project not found".to_string(),
            ))
        }
    };

    let mut users = Vec::new();
    for user_id in project.members {
        match get_user_by_id(user_id) {
            GetUserResult::Ok(user) => users.push(user),
            GetUserResult::Err(e) => {
                return ListProjectMembersResult::Err(AppError::InternalError(format!(
                    "Failed to get user with id: {}. Cause: {:#?}",
                    user_id, e
                )))
            }
        }
    }

    match paginate(
        &users,
        input.pagination.page_size,
        input.pagination.page_number,
        input.pagination.filters,
        input.pagination.sort,
    ) {
        Ok(result) => ListProjectMembersResult::Ok(result),
        Err(e) => ListProjectMembersResult::Err(e),
    }
}
