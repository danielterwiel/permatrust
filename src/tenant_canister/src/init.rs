use crate::logs::state::init_log_storage;
use crate::organization::methods::create_init_organization;
use crate::projects::methods::create_init_project;
use crate::{access_control::init_default_roles, users::methods::create_new_user};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use shared::logging::{
    init_logger, loggable_organization, loggable_user, set_log_storage, CanisterOrigin,
};
use shared::types::management::CreateInitTenantCanisterInput;
use shared::types::organization::{CreateInitOrganizationInput, CreateOrganizationResult};
use shared::types::projects::{CreateInitProjectInput, CreateProjectResult};
use shared::types::users::{CreateInitUserInput, CreateUserResult};
use shared::{log_error, log_info};

fn create_initial_entities(input: CreateInitTenantCanisterInput) -> Result<(), String> {
    let user_input = CreateInitUserInput {
        first_name: input.user.first_name.clone(),
        last_name: input.user.last_name.clone(),
        principal: input.principal,
    };
    let principal = user_input.principal;

    let user = match create_new_user(user_input) {
        CreateUserResult::Ok(user) => {
            log_info!(
                "user_creation: Created initial {} [principal={}]",
                loggable_user(&user),
                principal
            );
            user
        }
        CreateUserResult::Err(e) => {
            log_error!(
                "user_creation: Failed to create initial user [principal={}] - {:?}",
                principal,
                e
            );
            return Err(format!("Failed to create user: {:?}", e));
        }
    };

    let project_input = CreateInitProjectInput {
        name: input.project.name.clone(),
        members: vec![user.id],
        created_by: user.id,
    };
    let project_name = project_input.name.clone();

    let project_id = match create_init_project(project_input) {
        CreateProjectResult::Ok(project_id) => {
            log_info!(
                "project_creation: Created initial project [id={}, name='{}']",
                project_id,
                project_name
            );
            project_id
        }
        CreateProjectResult::Err(e) => {
            log_error!(
                "project_creation: Failed to create initial project [name='{}'] - {:?}",
                project_name,
                e
            );
            return Err(format!("Failed to create project: {:?}", e));
        }
    };

    let organization_input = CreateInitOrganizationInput {
        name: input.organization.name.clone(),
        created_by: user.id,
        members: vec![user.id],
        projects: vec![project_id],
    };
    let organization_name = organization_input.name.clone();

    match create_init_organization(organization_input) {
        CreateOrganizationResult::Ok(organization) => {
            log_info!(
                "organization_creation: Created initial {}",
                loggable_organization(&organization)
            );
        }
        CreateOrganizationResult::Err(e) => {
            log_error!(
                "organization_creation: Failed to create initial organization [name='{}'] - {:?}",
                organization_name,
                e
            );
            return Err(format!("Failed to create organization: {:?}", e));
        }
    };

    Ok(())
}

#[init]
fn init(input: CreateInitTenantCanisterInput) {
    // Initialize core systems first
    init_logger(CanisterOrigin::Tenant);
    let log_storage = init_log_storage();
    set_log_storage(log_storage);
    init_default_roles();

    log_info!(
        "initialization: Starting tenant canister [org='{}', project='{}']",
        input.organization.name,
        input.project.name
    );

    // Create initial entities
    if let Err(error) = create_initial_entities(input) {
        log_error!(
            "initialization: Failed to create initial entities - {}",
            error
        );
        ic_cdk::trap(&error);
    }

    log_info!("initialization: Tenant canister initialized successfully");
}

#[pre_upgrade]
fn pre_upgrade() {
    log_info!("upgrade_start: Pre-upgrade initiated");
    // Stable structures handle persistence automatically
    log_info!("upgrade_complete: Pre-upgrade completed successfully");
}

#[post_upgrade]
fn post_upgrade() {
    // Re-initialize stateless components first
    init_logger(CanisterOrigin::Tenant);
    let log_storage = init_log_storage();
    set_log_storage(log_storage);
    init_default_roles();

    log_info!("upgrade_start: Post-upgrade initiated");
    log_info!("upgrade_complete: Tenant canister post-upgrade completed successfully");
}
