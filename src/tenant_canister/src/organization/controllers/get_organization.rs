use crate::organization::organization_manager::OrganizationManager;
use shared::types::organization::GetOrganizationResult;

#[ic_cdk_macros::query]
pub fn get_organization() -> GetOrganizationResult {
    OrganizationManager::get_organization_query()
}
