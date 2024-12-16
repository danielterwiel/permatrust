use ic_cdk_macros::{query, update};
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::types::entities::Entity;
use shared::utils::filter::filter;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU32, Ordering};
use std::vec;

use shared::utils::pagination::paginate;

use shared::types::errors::AppError;
use shared::types::organizations::OrganizationId;
use shared::types::pagination::{
    FilterCriteria, FilterField, FilterOperator, PaginationInput, PaginationMetadata,
    ProjectFilterField,
};
use shared::types::projects::{Project, ProjectId, ProjectResult};

use crate::logger::{log_info, loggable_project};
use crate::users::get_user_by_principal;

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static PROJECTS: RefCell<StableBTreeMap<ProjectId, Project, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );

    static NEXT_ID: AtomicU32 = AtomicU32::new(0);
}

mod project_utils {
    use super::*;

    pub fn get_next_id() -> ProjectId {
        NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
    }

    pub fn get_all() -> Vec<Project> {
        PROJECTS.with(|projects| {
            projects
                .borrow()
                .iter()
                .map(|(_, project)| project.clone())
                .collect()
        })
    }

    pub fn get_by_organization_id(organization_id: OrganizationId) -> Vec<Project> {
        PROJECTS.with(|projects| {
            projects
                .borrow()
                .iter()
                .filter(|(_, proj)| proj.organizations.contains(&organization_id))
                .map(|(_, proj)| proj.clone())
                .collect()
        })
    }

    pub fn insert(id: ProjectId, project: Project) {
        PROJECTS.with(|projects| {
            projects.borrow_mut().insert(id, project);
        });
    }

    pub fn get_by_id(project_id: ProjectId) -> Option<Project> {
        PROJECTS.with(|projects| projects.borrow().get(&project_id))
    }
}

#[update]
fn create_project(organization_id: OrganizationId, name: String) -> Result<ProjectId, AppError> {
    let id = project_utils::get_next_id();
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

    project_utils::insert(id, project.clone());
    log_info("create_project", loggable_project(&project));

    Ok(id)
}

#[query]
fn get_projects() -> Result<Vec<Project>, AppError> {
    let caller = ic_cdk::caller();
    let user = get_user_by_principal(caller)
        .map_err(|e| AppError::EntityNotFound(format!("User not found, {:#?}", e)))?;

    let filter_criteria = FilterCriteria {
        field: FilterField::Project(ProjectFilterField::Members),
        entity: Entity::Project,
        value: user.id.to_string(),
        operator: FilterOperator::Contains,
    };

    let projects = project_utils::get_all();
    let projects = filter(&projects, vec![filter_criteria]);

    Ok(projects)
}

#[query]
fn list_projects(
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

#[query]
fn list_projects_by_organization_id(
    organization_id: OrganizationId,
    pagination: PaginationInput,
) -> Result<(Vec<Project>, PaginationMetadata), AppError> {
    let projects = project_utils::get_by_organization_id(organization_id);
    paginate(
        &projects,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[query]
fn get_project(project_id: ProjectId) -> ProjectResult {
    match project_utils::get_by_id(project_id) {
        Some(project) => ProjectResult::Ok(project),
        None => ProjectResult::Err(AppError::EntityNotFound("Project not found".to_string())),
    }
}
