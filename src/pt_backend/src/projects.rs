use ic_cdk_macros::{query, update};
use shared::pt_backend_generated::{AppError, Project, ProjectId, ProjectIdResult, ProjectsResult};
use std::cell::RefCell;
use std::collections::HashMap;
use std::vec;

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
        projects.borrow_mut().insert(id, project);
    });

    ProjectIdResult::Ok(id)
}

#[query]
fn list_projects() -> ProjectsResult {
    let projects =
        PROJECTS.with(|projects| projects.borrow().values().cloned().collect::<Vec<_>>());
    ProjectsResult::Ok(projects)
}
