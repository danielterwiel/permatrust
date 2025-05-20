use super::*;
use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::consts::memory_ids::INVITES_MEMORY_ID;
use shared::types::invites::InviteId;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU64, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static INVITES : RefCell<StableBTreeMap<InviteId, Invite, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(INVITES_MEMORY_ID))),
        )
    );

    static NEXT_ID: AtomicU64 = const { AtomicU64::new(0) };
}

pub fn get_next_id() -> InviteId {
    NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

pub fn get_all() -> Vec<Invite> {
    INVITES.with(|invites| {
        invites
            .borrow()
            .iter()
            .map(|(_, invite)| invite.clone())
            .collect()
    })
}

pub fn insert(id: InviteId, invite: Invite) {
    INVITES.with(|invites| {
        invites.borrow_mut().insert(id, invite);
    });
}

pub fn get_by_random(random: &String) -> Option<Invite> {
    INVITES.with(|users| {
        users
            .borrow()
            .iter()
            .find(|(_, user)| &user.random == random)
            .map(|(_, user)| user.clone())
    })
}
