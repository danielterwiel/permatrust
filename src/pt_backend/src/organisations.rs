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
    static NEXT_ID: RefCell<OrganisationId> = RefCell::new(0);
}

#[update]
fn create_organisation(name: String, organisation_id: OrganisationId) -> OrganisationIdResult {
    if name.trim().is_empty() {
        return OrganisationIdResult::Err(AppError::InternalError(
            "Organisation name cannot be empty".to_string(),
        ));
    }

    let caller = ic_cdk::caller();
    let id = NEXT_ID.with(|next_id| {
        let current_id = *next_id.borrow();
        *next_id.borrow_mut() += 1;
        current_id
    });

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
    let organisations = ORGANISATIONS
        .with(|organisations| organisations.borrow().values().cloned().collect::<Vec<_>>());

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
