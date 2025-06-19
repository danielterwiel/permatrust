pub mod access_control_manager;
pub mod controllers;

pub use access_control_manager::AccessControlManager;

pub fn init_default_roles() {
    AccessControlManager::init_default_roles()
}
