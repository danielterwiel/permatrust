use candid::Principal;
use ic_cdk_macros::{query, update};
use shared::pagination::{paginate, PaginatedOrganisationsResult};
use shared::pt_backend_generated::{
    AppError, Organisation, OrganisationId, OrganisationIdResult, OrganisationResult,
    PaginationInput,
};
use std::cell::RefCell;
use std::collections::HashMap;
use std::vec;

use crate::logger::{log_info, loggable_organisation};

thread_local! {
    static ORGANISATIONS: RefCell<HashMap<OrganisationId, Organisation>> = RefCell::new(HashMap::new());
}

pub fn get_next_organisation_id() -> u64 {
    ORGANISATIONS.with(|organisations| organisations.borrow().len() as u64)
}

fn get_organisations_by_user_id(user_id: Principal) -> Vec<Organisation> {
    ORGANISATIONS.with(|organisations| {
        organisations
            .borrow()
            .values()
            .filter(|org| org.members.contains(&user_id))
            .cloned()
            .collect()
    })
}

#[update]
fn create_organisation(name: String) -> OrganisationIdResult {
    if name.trim().is_empty() {
        return OrganisationIdResult::Err(AppError::InternalError(
            "Organisation name cannot be empty".to_string(),
        ));
    }

    let caller = ic_cdk::caller();

    ic_cdk::println!("caller: {}", caller);

    let id = get_next_organisation_id();

    let organisation = Organisation {
        id,
        name,
        members: vec![caller],
        projects: vec![],
        created_at: ic_cdk::api::time(),
        created_by: caller,
    };

    ORGANISATIONS.with(|organisations| {
        organisations.borrow_mut().insert(id, organisation.clone());
    });

    log_info("create_organisation", loggable_organisation(&organisation));

    OrganisationIdResult::Ok(id)
}

#[query]
fn list_organisations(pagination: PaginationInput) -> PaginatedOrganisationsResult {
    let user_id = ic_cdk::caller();
    let organisations = get_organisations_by_user_id(user_id);

    match paginate(&organisations, pagination.page_size, pagination.page_number) {
        Ok((paginated_organisations, pagination_metadata)) => {
            PaginatedOrganisationsResult::Ok(paginated_organisations, pagination_metadata)
        }
        Err(e) => PaginatedOrganisationsResult::Err(e),
    }
}

#[query]
fn get_organisation(organisation_id: OrganisationId) -> OrganisationResult {
    ORGANISATIONS.with(
        |organisations| match organisations.borrow().get(&organisation_id) {
            Some(organisation) => OrganisationResult::Ok(organisation.clone()),
            None => OrganisationResult::Err(AppError::EntityNotFound(
                "Organisation not found".to_string(),
            )),
        },
    )
}
