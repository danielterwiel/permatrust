use crate::organization::organization_manager::OrganizationManager;
use shared::types::organization::{CreateOrganizationInput, CreateOrganizationResult};

#[ic_cdk_macros::update]
pub fn create_organization(input: CreateOrganizationInput) -> CreateOrganizationResult {
    OrganizationManager::create_organization(input)
}
