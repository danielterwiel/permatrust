pub mod controllers;
pub mod organization_manager;

// Re-export the create_init_organization function for use in init.rs
pub use organization_manager::OrganizationManager;
pub fn create_init_organization(
    input: shared::types::organization::CreateInitOrganizationInput,
) -> shared::types::organization::CreateOrganizationResult {
    OrganizationManager::create_init_organization(input)
}
