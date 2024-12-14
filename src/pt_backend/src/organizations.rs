use crate::logger::{log_info, loggable_organization};
use crate::users::get_user_by_principal;
use ic_cdk_macros::{query, update};
use shared::types::errors::AppError;
use shared::types::organizations::{Organization, OrganizationId, OrganizationResult};
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::users::UserId;
use shared::utils::pagination::paginate;
use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::vec;

thread_local! {
    static ORGANIZATIONS: RefCell<HashMap<OrganizationId, Organization>> = RefCell::new(HashMap::new());
    static NEXT_ID: AtomicU32 = AtomicU32::new(0);
}

mod organization_utils {
    use super::*;

    pub fn get_next_id() -> OrganizationId {
        NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
    }

    pub fn get_by_user_id(user_id: UserId) -> Vec<Organization> {
        ORGANIZATIONS.with(|organizations| {
            organizations
                .borrow()
                .values()
                .filter(|org| org.members.contains(&user_id))
                .cloned()
                .collect()
        })
    }

    pub fn get_by_id(organization_id: OrganizationId) -> Option<Organization> {
        ORGANIZATIONS.with(|organizations| organizations.borrow().get(&organization_id).cloned())
    }

    pub fn insert(id: OrganizationId, organization: Organization) {
        ORGANIZATIONS.with(|organizations| {
            organizations.borrow_mut().insert(id, organization);
        });
    }

    pub fn validate_name(name: &str) -> Result<(), AppError> {
        if name.trim().is_empty() {
            return Err(AppError::InternalError(
                "Organization name cannot be empty".to_string(),
            ));
        }
        Ok(())
    }
}

#[update]
fn create_organization(name: String) -> Result<OrganizationId, AppError> {
    organization_utils::validate_name(&name)?;

    let caller = ic_cdk::caller();
    let user = get_user_by_principal(caller)?;
    let id = organization_utils::get_next_id();

    let organization = Organization {
        id,
        name,
        members: vec![user.id],
        projects: vec![],
        created_at: ic_cdk::api::time(),
        created_by: user.id,
    };

    organization_utils::insert(id, organization.clone());
    log_info("create_organization", loggable_organization(&organization));

    Ok(id)
}

#[query]
fn list_organizations(
    pagination: PaginationInput,
) -> Result<(Vec<Organization>, PaginationMetadata), AppError> {
    let caller = ic_cdk::caller();
    let user = get_user_by_principal(caller)?;
    let organizations = organization_utils::get_by_user_id(user.id);

    paginate(
        &organizations,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    )
}

#[query]
fn get_organization(organization_id: OrganizationId) -> OrganizationResult {
    match organization_utils::get_by_id(organization_id) {
        Some(organization) => OrganizationResult::Ok(organization),
        None => OrganizationResult::Err(AppError::EntityNotFound(
            "Organization not found".to_string(),
        )),
    }
}
