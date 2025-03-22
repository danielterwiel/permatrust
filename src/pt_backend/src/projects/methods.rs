use super::state;
use super::*;
use crate::users::get_user_by_principal;

use shared::types::entities::Entity;
use shared::types::pagination::{FilterCriteria, FilterField, FilterOperator, ProjectFilterField};
use shared::types::projects::{
    CreateProjectInput, CreateProjectResult, ListProjectMembersInput, ListProjectMembersResult,
    ListProjectsResult,
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
pub fn list_projects(pagination: PaginationInput) -> ListProjectsResult {
    let caller = ic_cdk::caller();
    let user = match get_user_by_principal(caller) {
        GetUserResult::Ok(u) => u,
        GetUserResult::Err(e) => return ListProjectsResult::Err(e),
    };

    // Filter projects where user is a member
    let member_filter = FilterCriteria {
        field: FilterField::Project(ProjectFilterField::Members),
        entity: Entity::Project,
        value: user.id.to_string(),
        operator: FilterOperator::Contains,
    };

    // Get projects and apply member filter
    let projects = state::get_all();
    let filtered_projects = filter(&projects, vec![member_filter]);

    // Apply pagination with any additional filters
    match paginate(
        &filtered_projects,
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
    let all_users = crate::users::state::get_all();

    match paginate(
        &all_users,
        input.pagination.page_size,
        input.pagination.page_number,
        input.pagination.filters,
        input.pagination.sort,
    ) {
        Ok(result) => ListProjectMembersResult::Ok(result),
        Err(e) => ListProjectMembersResult::Err(e),
    }
}
