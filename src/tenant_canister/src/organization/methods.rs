use super::state;
use crate::logger::{log_info, loggable_organization};
use crate::users::methods::get_user_by_principal;
use shared::types::organization::CreateInitOrganizationInput;
use shared::types::users::GetUserResult;
use shared::types::{
    errors::AppError,
    organization::{
        CreateOrganizationInput, CreateOrganizationResult, GetOrganizationResult, Organization,
    },
};

pub fn create_init_organization(input: CreateInitOrganizationInput) -> CreateOrganizationResult {
    let validate_result = state::validate_name(&input.name);
    if let Err(e) = validate_result {
        return CreateOrganizationResult::Err(e);
    }
    let organization = Organization {
        name: input.name,
        members: input.members,
        projects: input.projects,
        created_at: ic_cdk::api::time(),
        created_by: 0, // Placeholder for created_by
    };
    state::insert(organization.clone());
    log_info(
        "create_init_organization",
        loggable_organization(&organization),
    );
    CreateOrganizationResult::Ok(organization)
}

#[ic_cdk_macros::update]
pub fn create_organization(input: CreateOrganizationInput) -> CreateOrganizationResult {
    let validate_result = state::validate_name(&input.name);
    if let Err(e) = validate_result {
        return CreateOrganizationResult::Err(e);
    }

    let caller = ic_cdk::api::msg_caller();
    let user_result = get_user_by_principal(caller);
    let user = match user_result {
        GetUserResult::Ok(user) => user,
        GetUserResult::Err(e) => return CreateOrganizationResult::Err(e),
    };

    let organization = Organization {
        name: input.name,
        members: vec![user.id],
        projects: vec![],
        created_at: ic_cdk::api::time(),
        created_by: user.id,
    };

    state::insert(organization.clone());
    log_info("create_organization", loggable_organization(&organization));

    CreateOrganizationResult::Ok(organization)
}

#[ic_cdk_macros::query]
pub fn get_organization() -> GetOrganizationResult {
    let organization = state::get_organization();
    match organization {
        Some(organization) => {
            log_info("get_organization", loggable_organization(&organization));
            GetOrganizationResult::Ok(organization)
        }
        None => {
            log_info("get_organization", "Organization not found".to_string());
            GetOrganizationResult::Err(AppError::EntityNotFound(
                "Organization not found".to_string(),
            ))
        }
    }
}
