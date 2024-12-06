use ic_cdk_macros::{query, update};
use shared::utils::pagination::paginate;

use shared::types::errors::AppError;
use shared::types::organizations::{Organization, OrganizationId, OrganizationResult};
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::users::UserId;

use crate::users::get_user_by_principal;

use std::cell::RefCell;
use std::collections::HashMap;
use std::sync::atomic::{AtomicU32, Ordering};
use std::vec;

use crate::logger::{log_info, loggable_organization};

thread_local! {
    static ORGANIZATIONS: RefCell<HashMap<OrganizationId, Organization>> = RefCell::new(HashMap::new());
    static NEXT_ID: AtomicU32 = AtomicU32::new(0);
}

pub fn get_next_organization_id() -> OrganizationId {
    NEXT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

// TODO: Result
fn get_organizations_by_user_id(user_id: UserId) -> Vec<Organization> {
    ORGANIZATIONS.with(|organizations| {
        organizations
            .borrow()
            .values()
            .filter(|org| org.members.contains(&user_id))
            .cloned()
            .collect()
    })
}

#[update]
fn create_organization(name: String) -> Result<OrganizationId, AppError> {
    if name.trim().is_empty() {
        return Err(AppError::InternalError(
            "Organization name cannot be empty".to_string(),
        ));
    }

    let caller = ic_cdk::caller();
    let user = get_user_by_principal(caller)?;
    let id = get_next_organization_id();

    let organization = Organization {
        id,
        name,
        members: vec![user.id],
        projects: vec![],
        created_at: ic_cdk::api::time(),
        created_by: user.id,
    };

    ORGANIZATIONS.with(|organizations| {
        organizations.borrow_mut().insert(id, organization.clone());
    });

    log_info("create_organization", loggable_organization(&organization));

    Ok(id)
}

#[query]
fn list_organizations(
    pagination: PaginationInput,
) -> Result<(Vec<Organization>, PaginationMetadata), AppError> {
    let caller = ic_cdk::caller();
    let user = get_user_by_principal(caller)?;
    let organizations = get_organizations_by_user_id(user.id);

    match paginate(
        &organizations,
        pagination.page_size,
        pagination.page_number,
        pagination.filters,
        pagination.sort,
    ) {
        Ok((paginated_organizations, pagination_metadata)) => {
            Ok((paginated_organizations, pagination_metadata))
        }
        Err(e) => Err(e),
    }
}

#[query]
fn get_organization(organization_id: OrganizationId) -> OrganizationResult {
    ORGANIZATIONS.with(
        |organizations| match organizations.borrow().get(&organization_id) {
            Some(organization) => OrganizationResult::Ok(organization.clone()),
            None => OrganizationResult::Err(AppError::EntityNotFound(
                "Organization not found".to_string(),
            )),
        },
    )
}
