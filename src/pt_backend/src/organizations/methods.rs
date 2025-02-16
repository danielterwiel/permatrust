use super::state;
use super::*;
use crate::logger::{log_info, loggable_organization};
use crate::users::get_user_by_principal;
use shared::types::organizations::{
    CreateOrganizationInput, CreateOrganizationResult, GetOrganizationResult,
    ListOrganizationsResult, OrganizationIdInput,
};
use shared::types::users::GetUserResult;
use shared::utils::pagination::paginate;

#[ic_cdk_macros::update]
pub fn create_organization(input: CreateOrganizationInput) -> CreateOrganizationResult {
    let validate_result = state::validate_name(&input.name);
    if let Err(e) = validate_result {
        return CreateOrganizationResult::Err(e);
    }

    let caller = ic_cdk::caller();
    let user = match get_user_by_principal(caller) {
        GetUserResult::Ok(u) => u,
        GetUserResult::Err(e) => return CreateOrganizationResult::Err(e),
    };

    let id = state::get_next_id();
    let organization = Organization {
        id,
        name: input.name,
        members: vec![user.id],
        projects: vec![],
        created_at: ic_cdk::api::time(),
        created_by: user.id,
    };

    state::insert(id, organization.clone());
    log_info("create_organization", loggable_organization(&organization));

    CreateOrganizationResult::Ok(id)
}

#[ic_cdk_macros::query]
pub fn list_organizations(pagination: PaginationInput) -> ListOrganizationsResult {
    let caller = ic_cdk::caller();
    let user = match get_user_by_principal(caller) {
        GetUserResult::Ok(u) => u,
        GetUserResult::Err(e) => return ListOrganizationsResult::Err(e),
    };

    let organizations = state::get_by_user_id(user.id);
    match paginate(
        &organizations,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok(result) => ListOrganizationsResult::Ok(result),
        Err(e) => ListOrganizationsResult::Err(e),
    }
}

#[ic_cdk_macros::query]
pub fn get_organization(input: OrganizationIdInput) -> GetOrganizationResult {
    match state::get_by_id(input.id) {
        Some(org) => GetOrganizationResult::Ok(org),
        None => GetOrganizationResult::Err(AppError::EntityNotFound(
            "Organization not found".to_string(),
        )),
    }
}
