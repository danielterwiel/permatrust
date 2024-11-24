use ic_cdk_macros::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::vec;

use shared::utils::pagination::paginate;

use shared::types::errors::AppError;
use shared::types::organisations::OrganisationId;
use shared::types::pagination::PaginationInput;
use shared::types::projects::{
    PaginatedProjectsResult, PaginatedProjectsResultOk, Project, ProjectId, ProjectIdResult,
    ProjectResult,
};

use crate::logger::{log_info, loggable_project};

thread_local! {
    static PROJECTS: RefCell<HashMap<ProjectId, Project>> = RefCell::new(HashMap::new());
    static NEXT_ID: AtomicU64 = AtomicU64::new(0);
}

pub fn get_next_project_id() -> u64 {
    NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

fn get_projects() -> Vec<Project> {
    PROJECTS.with(|projects| projects.borrow().values().cloned().collect())
}

fn get_projects_by_organisation_id(organisation_id: OrganisationId) -> Vec<Project> {
    PROJECTS.with(|projects| {
        projects
            .borrow()
            .values()
            .filter(|proj| proj.organisations.contains(&organisation_id))
            .cloned()
            .collect()
    })
}

#[update]
fn create_project(organisation_id: OrganisationId, name: String) -> ProjectIdResult {
    let id = get_next_project_id();
    if name.trim().is_empty() {
        return ProjectIdResult::Err(AppError::InternalError(
            "Project name cannot be empty".to_string(),
        ));
    }
    let caller = ic_cdk::caller();

    let project = Project {
        id,
        name,
        members: vec![caller],
        organisations: vec![organisation_id],
        created_at: ic_cdk::api::time(),
        created_by: caller,
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
    let projects = get_projects();
    match paginate(
        &projects,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok((paginated_projects, pagination_metadata)) => PaginatedProjectsResult::Ok(
            PaginatedProjectsResultOk(paginated_projects, pagination_metadata),
        ),
        Err(e) => PaginatedProjectsResult::Err(e),
    }
}

#[query]
fn list_projects_by_organisation_id(
    organisation_id: OrganisationId,
    pagination: PaginationInput,
) -> PaginatedProjectsResult {
    let projects = get_projects_by_organisation_id(organisation_id);
    match paginate(
        &projects,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok((paginated_projects, pagination_metadata)) => PaginatedProjectsResult::Ok(
            PaginatedProjectsResultOk(paginated_projects, pagination_metadata),
        ),
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
