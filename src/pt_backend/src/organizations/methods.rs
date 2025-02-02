use super::state;
use super::*;
use crate::logger::{log_info, loggable_organization};
use crate::users::get_user_by_principal;
use shared::types::errors::AppError;
use shared::utils::pagination::paginate;

#[ic_cdk_macros::update]
pub fn create_organization(name: String) -> Result<OrganizationId, AppError> {
    state::validate_name(&name)?;

    let caller = ic_cdk::caller();
    let user = get_user_by_principal(caller)?;
    let id = state::get_next_id();

    let organization = Organization {
        id,
        name,
        members: vec![user.id],
        projects: vec![],
        created_at: ic_cdk::api::time(),
        created_by: user.id,
    };

    state::insert(id, organization.clone());
    log_info("create_organization", loggable_organization(&organization));

    Ok(id)
}

#[ic_cdk_macros::query]
pub fn list_organizations(
    pagination: PaginationInput,
) -> Result<(Vec<Organization>, PaginationMetadata), AppError> {
    let caller = ic_cdk::caller();
    let user = get_user_by_principal(caller)?;
    let organizations = state::get_by_user_id(user.id);

    paginate(
        &organizations,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[ic_cdk_macros::query]
pub fn get_organization(organization_id: OrganizationId) -> OrganizationResult {
    match state::get_by_id(organization_id) {
        Some(organization) => OrganizationResult::Ok(organization),
        None => OrganizationResult::Err(AppError::EntityNotFound(
            "Organization not found".to_string(),
        )),
    }
}
