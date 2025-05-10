use crate::access_control::init_default_roles;
use crate::logger::init_logger;
use crate::organization::methods::create_organization;
use ic_cdk_macros::init;
use shared::types::{
    organization::{CreateOrganizationInput, CreateOrganizationResult},
    tenant::TenantInitArgs,
};

#[init]
fn init(args: TenantInitArgs) {
    init_logger();
    init_default_roles();

    // Since company_name is now a String, we can directly use it.
    let input = CreateOrganizationInput {
        name: args.company_name,
    };
    let result = create_organization(input);

    match result {
        CreateOrganizationResult::Ok(organization) => {
            ic_cdk::println!("Created organization: {}", organization.name);
        }
        CreateOrganizationResult::Err(e) => {
            ic_cdk::println!("Failed to create organization: {:?}", e);
        }
    }
}
