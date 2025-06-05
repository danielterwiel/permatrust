use crate::logger::init_logger;
use crate::organization::methods::create_init_organization;
use crate::projects::methods::create_init_project;
use crate::{access_control::init_default_roles, users::methods::create_new_user};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade};
use shared::types::management::CreateInitTenantCanisterInput;
use shared::types::organization::{CreateInitOrganizationInput, CreateOrganizationResult};
use shared::types::projects::{CreateInitProjectInput, CreateProjectResult};
use shared::types::users::{CreateInitUserInput, CreateUserResult};

fn create_initial_entities(input: CreateInitTenantCanisterInput) -> Result<(), String> {
    let user_input = CreateInitUserInput {
        first_name: input.user.first_name,
        last_name: input.user.last_name,
        principal: input.principal,
    };

    let user = match create_new_user(user_input) {
        CreateUserResult::Ok(user) => {
            ic_cdk::println!("Created user: {} {}", user.first_name, user.last_name);
            user
        }
        CreateUserResult::Err(e) => {
            return Err(format!("Failed to create user: {:?}", e));
        }
    };

    let project_input = CreateInitProjectInput {
        name: input.project.name,
        members: vec![user.id],
        created_by: user.id,
    };

    let project_id = match create_init_project(project_input) {
        CreateProjectResult::Ok(project_id) => {
            ic_cdk::println!("Created project with ID: {}", project_id);
            project_id
        }
        CreateProjectResult::Err(e) => {
            return Err(format!("Failed to create project: {:?}", e));
        }
    };

    let organization_input = CreateInitOrganizationInput {
        name: input.organization.name,
        created_by: user.id,
        members: vec![user.id],
        projects: vec![project_id],
    };

    match create_init_organization(organization_input) {
        CreateOrganizationResult::Ok(organization) => {
            ic_cdk::println!("Created organization: {}", organization.name);
        }
        CreateOrganizationResult::Err(e) => {
            return Err(format!("Failed to create organization: {:?}", e));
        }
    };

    Ok(())
}

#[init]
fn init(input: CreateInitTenantCanisterInput) {
    ic_cdk::println!("Tenant canister: Initializing...");

    // Initialize core systems
    init_logger();
    init_default_roles();

    // Create initial entities
    if let Err(error) = create_initial_entities(input) {
        ic_cdk::eprintln!("Initialization failed: {}", error);
        ic_cdk::trap(&error);
    }

    ic_cdk::println!("Tenant canister: Initialization complete");
}

#[pre_upgrade]
fn pre_upgrade() {
    ic_cdk::println!("Tenant canister: Pre-upgrade started");
    // Stable structures handle persistence automatically
    ic_cdk::println!("Tenant canister: Pre-upgrade complete");
}

#[post_upgrade]
fn post_upgrade() {
    ic_cdk::println!("Tenant canister: Post-upgrade started");

    // Re-initialize stateless components
    init_logger();
    init_default_roles();

    ic_cdk::println!("Tenant canister: Post-upgrade complete");
}
