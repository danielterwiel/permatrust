use crate::logger::init_logger;
use crate::{
    access_control::init_default_roles, organization::methods::create_organization,
    projects::methods::create_project, users::methods::create_user,
};
use ic_cdk_macros::init;
use shared::types::management::CreateCanisterTenantInput;
use shared::types::projects::{CreateProjectInput, CreateProjectResult};
use shared::types::users::CreateUserResult;
use shared::types::{
    organization::{CreateOrganizationInput, CreateOrganizationResult},
    users::CreateUserInput,
};

#[init]
fn init(input: CreateCanisterTenantInput) {
    init_logger();
    init_default_roles();

    let user_input = CreateUserInput {
        first_name: input.user.first_name,
        last_name: input.user.last_name,
    };
    let user_result = create_user(user_input);
    match user_result {
        CreateUserResult::Ok(user) => {
            ic_cdk::println!("Created user: {} {}", user.first_name, user.last_name);
        }
        CreateUserResult::Err(e) => {
            ic_cdk::println!("Failed to create user: {:?}", e);
        }
    };

    let organization_input = CreateOrganizationInput {
        name: input.organization.name,
    };
    let organization_result = create_organization(organization_input);
    match organization_result {
        CreateOrganizationResult::Ok(organization) => {
            ic_cdk::println!("Created organization: {}", organization.name);
        }
        CreateOrganizationResult::Err(e) => {
            ic_cdk::println!("Failed to create organization: {:?}", e);
        }
    };

    let project_input = CreateProjectInput {
        name: input.project.name,
    };
    let project_result = create_project(project_input);
    match project_result {
        CreateProjectResult::Ok(project) => {
            ic_cdk::println!("Created project. ID: {}", project);
        }
        CreateProjectResult::Err(e) => {
            ic_cdk::println!("Failed to create project: {:?}", e);
        }
    };

    ic_cdk::println!("Tenant canister initialized");
}
