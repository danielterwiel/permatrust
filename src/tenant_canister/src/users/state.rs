use super::*;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::consts::memory_ids::USERS_MEMORY_ID;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU8, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static USERS: RefCell<StableBTreeMap<UserId, User, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(USERS_MEMORY_ID))),
        )
    );

    static NEXT_ID: AtomicU8= const { AtomicU8::new(0) };
}

pub fn get_next_id() -> u8 {
    NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

pub fn insert(user: User) {
    USERS.with(|users| {
        users.borrow_mut().insert(user.id, user);
    });
}

pub fn get_all() -> Vec<User> {
    USERS.with(|users| {
        users
            .borrow()
            .iter()
            .map(|(_, user)| user.clone())
            .collect()
    })
}

pub fn get_by_principal(principal: Principal) -> Option<User> {
    USERS.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| user.principals.contains(&principal))
            .map(|(_, user)| user.clone())
    })
}
