use super::*;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU32, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static ORGANIZATIONS: RefCell<StableBTreeMap<OrganizationId, Organization, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0))),
        )
    );

    static NEXT_ID: AtomicU32 = const { AtomicU32::new(0) };
}

pub fn get_next_id() -> OrganizationId {
    NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

pub fn get_by_user_id(user_id: UserId) -> Vec<Organization> {
    ORGANIZATIONS.with(|organizations| {
        organizations
            .borrow()
            .iter()
            .filter(|(_, org)| org.members.contains(&user_id))
            .map(|(_, org)| org.clone())
            .collect()
    })
}

pub fn insert(id: OrganizationId, organization: Organization) {
    ORGANIZATIONS.with(|organizations| {
        organizations.borrow_mut().insert(id, organization);
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
