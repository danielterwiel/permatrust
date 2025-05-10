use super::Organization;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableCell,
};
use shared::types::errors::AppError;
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static ORGANIZATION: RefCell<StableCell<Option<Organization>, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
            None,
        ).expect("Failed to initialize organization stable cell")
    );
}

pub fn get_organization() -> Option<Organization> {
    ORGANIZATION.with(|cell| cell.borrow().get().clone())
}

pub fn insert(organization: Organization) {
    ORGANIZATION.with(|cell| {
        cell.borrow_mut()
            .set(Some(organization))
            .expect("Failed to set organization in stable memory");
    });
}

pub fn validate_name(name: &str) -> Result<(), AppError> {
    if name.trim().is_empty() {
        return Err(AppError::InternalError(
            "Organization name cannot be empty".to_string(),
        ));
    }
    Ok(())
}
