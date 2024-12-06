use ic_cdk_macros::{query, update};
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::vec;

use shared::utils::pagination::paginate;

use shared::types::errors::AppError;
use shared::types::organizations::OrganizationId;
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::projects::{Project, ProjectId, ProjectResult};

use crate::logger::{log_info, loggable_project};
use crate::users::get_user_by_principal;

thread_local! {
    static PROJECTS: RefCell<HashMap<ProjectId, Project>> = RefCell::new(HashMap::new());
    static NEXT_ID: AtomicU32 = AtomicU32::new(0);
}

pub fn get_next_project_id() -> ProjectId {
    NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

fn get_projects() -> Vec<Project> {
    PROJECTS.with(|projects| projects.borrow().values().cloned().collect())
}

fn get_projects_by_organization_id(organization_id: OrganizationId) -> Vec<Project> {
    PROJECTS.with(|projects| {
        projects
            .borrow()
            .values()
            .filter(|proj| proj.organizations.contains(&organization_id))
            .cloned()
            .collect()
    })
}

#[update]
fn create_project(organization_id: OrganizationId, name: String) -> Result<ProjectId, AppError> {
    let id = get_next_project_id();
    if name.trim().is_empty() {
        return Err(AppError::InternalError(
            "Project name cannot be empty".to_string(),
        ));
    }
    let caller = ic_cdk::caller();
    let user = get_user_by_principal(caller)?;

    let project = Project {
        id,
        name,
        members: vec![user.id],
        organizations: vec![organization_id],
        created_at: ic_cdk::api::time(),
        created_by: user.id,
        documents: vec![],
    };

    PROJECTS.with(|projects| {
        projects.borrow_mut().insert(id, project.clone());
    });

    log_info("create_project", loggable_project(&project));

    Ok(id)
}

#[query]
fn list_projects(
    pagination: PaginationInput,
) -> Result<(Vec<Project>, PaginationMetadata), AppError> {
    let projects = get_projects();
    match paginate(
        &projects,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok((paginated_projects, pagination_metadata)) => {
            Ok((paginated_projects, pagination_metadata))
        }
        Err(e) => Err(e),
    }
}

#[query]
fn list_projects_by_organization_id(
    organization_id: OrganizationId,
    pagination: PaginationInput,
) -> Result<(Vec<Project>, PaginationMetadata), AppError> {
    let projects = get_projects_by_organization_id(organization_id);
    match paginate(
        &projects,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok((paginated_projects, pagination_metadata)) => {
            Ok((paginated_projects, pagination_metadata))
        }
        Err(e) => Err(e),
    }
}

#[query]
fn get_project(project_id: ProjectId) -> ProjectResult {
    PROJECTS.with(|projects| match projects.borrow().get(&project_id) {
        Some(project) => ProjectResult::Ok(project.clone()),
        None => ProjectResult::Err(AppError::EntityNotFound("Project not found".to_string())),
    })
}
