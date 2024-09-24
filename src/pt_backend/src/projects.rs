use ic_cdk_macros::{query, update};
use shared::pt_backend_generated::{Project, ProjectId};
use std::cell::RefCell;
use std::collections::HashMap;
use std::vec;

thread_local! {
    static PROJECTS: RefCell<HashMap<ProjectId, Project>> = RefCell::new(HashMap::new());
    static NEXT_ID: RefCell<ProjectId> = RefCell::new(0);
}

// #[init]
// fn init() {
//     // Initialization logic, if needed
// }

#[update]
fn create_project(name: String) -> ProjectId {
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

    id
}

// #[query]
// fn get_project(id: ProjectId) -> Option<&'static Project> {
//     // TODO: impl Document fn to_view
//     PROJECTS.with(|project| project.borrow().get(&id))
// }

// #[update]
// fn update_project(
//     id: ProjectId,
//     title: Option<String>,
//     content: Option<serde_bytes::ByteBuf>,
// ) -> Result<(), String> {
//     let caller = ic_cdk::caller();
//
//     PROJECTS.with(|projects| {
//         let mut project = projects.borrow_mut();
//         if let Some(doc) = project.get_mut(&id) {
//             if doc.author != caller {
//                 return Err("Only the author can update the document".to_string());
//             }
//
//             if let Some(new_title) = title {
//                 doc.title = new_title;
//             }
//             if let Some(new_content) = content {
//                 doc.content = new_content;
//             }
//             doc.version += 1;
//             doc.timestamp = ic_cdk::api::time();
//             Ok(())
//         } else {
//             Err("Project not found".to_string())
//         }
//     })
// }

// #[update]
// fn delete_project(id: ProjectId) -> Result<(), String> {
//     let caller = ic_cdk::caller();
//
//     PROJECTS.with(|projects| {
//         let mut project = projects.borrow_mut();
//         if let Some(doc) = project.get(&id) {
//             if doc.author != caller {
//                 return Err("Only the author can delete the document".to_string());
//             }
//             project.remove(&id);
//             Ok(())
//         } else {
//             Err("Document not found".to_string())
//         }
//     })
// }

#[query]
fn list_projects() -> Vec<Project> {
    PROJECTS.with(|projects| projects.borrow().values().cloned().collect())
}

// ic_cdk::export_candid!();
