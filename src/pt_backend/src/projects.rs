use ic_cdk_macros::{query, update};
use shared::pagination::{paginate, PaginatedProjectsResult};
use shared::pt_backend_generated::{
    AppError, PaginationInput, Project, ProjectId, ProjectIdResult, ProjectResult,
};
use std::cell::RefCell;
use std::collections::HashMap;
use std::vec;

use crate::logger::{log_info, loggable_project};

thread_local! {
    static PROJECTS: RefCell<HashMap<ProjectId, Project>> = RefCell::new(HashMap::new());
    static NEXT_ID: RefCell<ProjectId> = RefCell::new(0);
}

#[update]
fn create_project(name: String) -> ProjectIdResult {
    if name.trim().is_empty() {
        return ProjectIdResult::Err(AppError::InternalError(
            "Project name cannot be empty".to_string(),
        ));
    }

    let caller = ic_cdk::caller();
    let id = NEXT_ID.with(|next_id| {
        let current_id = *next_id.borrow();
        *next_id.borrow_mut() += 1;
        current_id
    });

    let project = Project {
        id,
        name,
        timestamp: ic_cdk::api::time(),
        author: caller,
        documents: vec![],
    };

    PROJECTS.with(|projects| {
        projects.borrow_mut().insert(id, project.clone());
    });

    log_info("create_project", loggable_project(&project));

    ProjectIdResult::Ok(id)
}

#[query]
fn list_projects(pagination: PaginationInput) -> PaginatedProjectsResult {
    let projects =
        PROJECTS.with(|projects| projects.borrow().values().cloned().collect::<Vec<_>>());

    match paginate(&projects, pagination.page_size, pagination.page_number) {
        Ok((paginated_projects, pagination_metadata)) => {
            PaginatedProjectsResult::Ok(paginated_projects, pagination_metadata)
        }
        Err(e) => PaginatedProjectsResult::Err(e),
    }
}

#[query]
fn get_project(project_id: ProjectId) -> ProjectResult {
    PROJECTS.with(|projects| match projects.borrow().get(&project_id) {
        Some(project) => ProjectResult::Ok(project.clone()),
        None => ProjectResult::Err(AppError::EntityNotFound("Project not found".to_string())),
    })
}
