use super::state;
use super::*;

use shared::types::projects::{
    CreateInitProjectInput, CreateProjectInput, CreateProjectResult, ListProjectMembersInput,
    ListProjectMembersResult, ListProjectsResult,
};
use shared::types::users::GetUserResult;
use shared::utils::pagination::paginate;

use crate::logger::{log_info, loggable_project};
use crate::users::methods::get_user_by_principal;

pub fn create_init_project(input: CreateInitProjectInput) -> CreateProjectResult {
    if input.name.trim().is_empty() {
        return CreateProjectResult::Err(AppError::InternalError(
            "Project name cannot be empty".to_string(),
        ));
    }
    let id = state::get_next_id();
    let project = Project {
        id,
        name: input.name,
        members: input.members,
        created_at: ic_cdk::api::time(),
        created_by: input.created_by,
        documents: vec![],
    };
    state::insert(id, project.clone());
    log_info("create_init_project", loggable_project(&project));

    CreateProjectResult::Ok(id)
}

#[ic_cdk_macros::update]
pub fn create_project(input: CreateProjectInput) -> CreateProjectResult {
    if input.name.trim().is_empty() {
        return CreateProjectResult::Err(AppError::InternalError(
            "Project name cannot be empty".to_string(),
        ));
    }

    let caller = ic_cdk::api::msg_caller();
    let user = match get_user_by_principal(caller) {
        GetUserResult::Ok(u) => u,
        GetUserResult::Err(e) => return CreateProjectResult::Err(e),
    };

    let id = state::get_next_id();
    let project = Project {
        id,
        name: input.name,
        members: vec![user.id],
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
    let projects = state::get_all();

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
