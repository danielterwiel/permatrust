use candid::Principal;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static IDENTITY_TENANT_MAP: RefCell<StableBTreeMap<Principal, Principal, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1))),
        )
    );
}

// TODO: Add a function to get all companies for a given identity
pub fn get_by_identity(identity: Principal) -> Option<Principal> {
    IDENTITY_TENANT_MAP.with(|projects| projects.borrow().get(&identity))
}

pub fn insert(identity: Principal, tenant_canister_id: Principal) {
    IDENTITY_TENANT_MAP.with(|tenants| {
        tenants.borrow_mut().insert(identity, tenant_canister_id);
    });
}
