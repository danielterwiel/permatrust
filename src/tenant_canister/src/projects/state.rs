use super::*;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::consts::memory_ids::PROJECTS_MEMORY_ID;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU32, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static PROJECTS: RefCell<StableBTreeMap<ProjectId, Project, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(PROJECTS_MEMORY_ID))),
        )
    );

    static NEXT_ID: AtomicU32 = const { AtomicU32::new(0) };
}

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

pub fn insert(id: ProjectId, project: Project) {
    PROJECTS.with(|projects| {
        projects.borrow_mut().insert(id, project);
    });
}
