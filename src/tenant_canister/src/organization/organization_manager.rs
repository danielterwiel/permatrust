use crate::users::user_manager::UserManager;
use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableCell,
};
use shared::{
    consts::memory_ids::tenant_canister::ORGANIZATION_MEMORY_ID,
    log_debug, log_info, log_warn,
    types::{
        errors::AppError,
        organization::{
            CreateInitOrganizationInput, CreateOrganizationInput, CreateOrganizationResult,
            GetOrganizationResult, Organization,
        },
        users::GetUserResult,
    },
    utils::logs::loggable_organization,
};
use std::cell::RefCell;

type Memory = VirtualMemory<DefaultMemoryImpl>;

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static ORGANIZATION: RefCell<StableCell<Option<Organization>, Memory>> = RefCell::new(
        StableCell::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(ORGANIZATION_MEMORY_ID))),
            None,
        ).expect("Failed to initialize organization stable cell")
    );
}

pub struct OrganizationManager {}

impl OrganizationManager {
    pub fn get_organization() -> Option<Organization> {
        ORGANIZATION.with(|cell| cell.borrow().get().clone())
    }

    pub fn insert(organization: Organization) {
        ORGANIZATION.with(|cell| {
            cell.borrow_mut()
                .set(Some(organization))
                .expect("Failed to set organization in stable memory");
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

    pub fn create_init_organization(
        input: CreateInitOrganizationInput,
    ) -> CreateOrganizationResult {
        log_debug!(
            "organization_creation: Initial organization creation [name='{}', member_count={}]",
            input.name,
            input.members.len()
        );

        let validate_result = Self::validate_name(&input.name);
        if let Err(e) = validate_result {
            log_warn!(
                "organization_creation: Validation failed [name='{}'] - {:?}",
                input.name,
                e
            );
            return CreateOrganizationResult::Err(e);
        }
        let organization = Organization {
            name: input.name,
            members: input.members,
            projects: input.projects,
            created_at: ic_cdk::api::time(),
            created_by: 0, // Placeholder for created_by
        };
        Self::insert(organization.clone());
        log_info!("organization_creation: Successfully created initial organization [name='{}', member_count={}, timestamp={}]",
                 organization.name, organization.members.len(), organization.created_at);
        CreateOrganizationResult::Ok(organization)
    }

    pub fn create_organization(input: CreateOrganizationInput) -> CreateOrganizationResult {
        let caller = ic_cdk::api::msg_caller();
        log_debug!(
            "auth_check: Organization creation attempt [principal={}, name='{}']",
            caller,
            input.name
        );

        let validate_result = Self::validate_name(&input.name);
        if let Err(e) = validate_result {
            log_warn!(
                "organization_creation: Validation failed [principal={}, name='{}'] - {:?}",
                caller,
                input.name,
                e
            );
            return CreateOrganizationResult::Err(e);
        }

        log_debug!(
            "auth_check: Validating user for organization creation [principal={}]",
            caller
        );
        let user_result = UserManager::get_user_by_principal(caller);
        let user = match user_result {
            GetUserResult::Ok(user) => {
                log_debug!(
                    "auth_check: User validated for organization creation [user_id={}, principal={}]",
                    user.id,
                    caller
                );
                user
            }
            GetUserResult::Err(e) => {
                log_warn!(
                    "auth_check: Authentication failed for organization creation [principal={}] - {:?}",
                    caller,
                    e
                );
                return CreateOrganizationResult::Err(e);
            }
        };

        let organization = Organization {
            name: input.name,
            members: vec![user.id],
            projects: vec![],
            created_at: ic_cdk::api::time(),
            created_by: user.id,
        };

        Self::insert(organization.clone());
        log_info!("organization_creation: Successfully created organization [name='{}', created_by={}, member_count={}, principal={}, timestamp={}]",
                 organization.name, organization.created_by, organization.members.len(), caller, organization.created_at);

        CreateOrganizationResult::Ok(organization)
    }

    pub fn get_organization_query() -> GetOrganizationResult {
        let principal = ic_cdk::api::msg_caller();
        log_debug!(
            "auth_check: Organization retrieval attempt [principal={}]",
            principal
        );

        // TODO: Add permission validation here when authorization system is implemented
        // log_debug!("access_control: Checking organization access permissions [principal={}]", principal);

        let organization = Self::get_organization();
        match organization {
            Some(organization) => {
                log_info!(
                    "organization_access: Retrieved {} [principal={}]",
                    loggable_organization(&organization),
                    principal
                );
                GetOrganizationResult::Ok(organization)
            }
            None => {
                log_warn!(
                    "organization_access: Organization not found [principal={}]",
                    principal
                );
                GetOrganizationResult::Err(AppError::EntityNotFound(
                    "Organization not found".to_string(),
                ))
            }
        }
    }
}
