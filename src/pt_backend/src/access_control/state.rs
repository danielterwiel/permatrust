use super::*;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU64, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static ROLES: RefCell<StableBTreeMap<RoleId, Role, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(6))),
        )
    );

    static USER_ROLES: RefCell<StableBTreeMap<UserId, RoleIdVec, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(7))),
        )
    );

    static NEXT_ACCESS_CONTROL_ID: AtomicU64 = const { AtomicU64::new(0) }
}

pub fn get_next_id() -> RoleId {
    NEXT_ACCESS_CONTROL_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

pub fn insert_role(role_id: RoleId, role: Role) {
    ROLES.with(|roles| roles.borrow_mut().insert(role_id, role));
}

pub fn get_role(role_id: &RoleId) -> Option<Role> {
    ROLES.with(|roles| roles.borrow().get(role_id))
}

// pub fn get_all_roles() -> Vec<Role> {
//     ROLES.with(|roles| roles.borrow().iter().map(|(_, role)| role).collect())
// }

pub fn get_roles_by_project(project_id: u32) -> Vec<Role> {
    ROLES.with(|roles| {
        roles
            .borrow()
            .iter()
            .filter(|(_, role)| role.project_id == project_id)
            .map(|(_, role)| role)
            .collect()
    })
}

pub fn get_user_role_ids(user_id: &UserId) -> Option<RoleIdVec> {
    USER_ROLES.with(|user_roles| user_roles.borrow().get(user_id))
}

pub fn insert_user_roles(user: UserId, roles: RoleIdVec) {
    USER_ROLES.with(|user_roles| user_roles.borrow_mut().insert(user, roles));
}

pub fn update_role(role_id: RoleId, role: Role) {
    ROLES.with(|roles| roles.borrow_mut().insert(role_id, role));
}
