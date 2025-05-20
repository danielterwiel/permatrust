use crate::logger::init_logger;
use crate::organization::methods::create_init_organization;
use crate::projects::methods::create_init_project;
use crate::{access_control::init_default_roles, users::methods::create_new_user};
use ic_cdk_macros::init;
use shared::types::management::CreateInitTenantCanisterInput;
use shared::types::organization::{CreateInitOrganizationInput, CreateOrganizationResult};
use shared::types::projects::{CreateInitProjectInput, CreateProjectResult};
use shared::types::users::{CreateInitUserInput, CreateUserResult};

#[init]
fn init(input: CreateInitTenantCanisterInput) {
    init_logger();
    init_default_roles();

    let user_input = CreateInitUserInput {
        first_name: input.user.first_name,
        last_name: input.user.last_name,
        principal: input.principal,
    };
    let user_result = create_new_user(user_input);
    let user = match user_result {
        CreateUserResult::Ok(user) => {
            ic_cdk::println!("Created user: {} {}", user.first_name, user.last_name);
            user
        }
        CreateUserResult::Err(e) => {
            ic_cdk::println!("Failed to create user: {:?}", e);
            panic!("Failed to create user: {:?}", e);
        }
    };

    let project_input = CreateInitProjectInput {
        name: input.project.name,
        members: vec![user.id],
        created_by: user.id,
    };
    let project_result = create_init_project(project_input);
    let project_id = match project_result {
        CreateProjectResult::Ok(project) => {
            ic_cdk::println!("Created project. ID: {}", project);
            project
        }
        CreateProjectResult::Err(e) => {
            ic_cdk::println!("Failed to create project: {:?}", e);
            panic!("Failed to create project: {:?}", e);
        }
    };

    let organization_input = CreateInitOrganizationInput {
        name: input.organization.name,
        created_by: user.id,
        members: vec![user.id],
        projects: vec![project_id],
    };
    let organization_result = create_init_organization(organization_input);
    match organization_result {
        CreateOrganizationResult::Ok(organization) => {
            ic_cdk::println!("Created organization: {}", organization.name);
        }
        CreateOrganizationResult::Err(e) => {
            ic_cdk::println!("Failed to create organization: {:?}", e);
        }
    };

    ic_cdk::println!("Tenant canister initialized");
}
