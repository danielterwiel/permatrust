use crate::management::types::{
    CreateTenantCanisterInput, CreateTenantCanisterResult, GetAllTenantCanistersResult,
    GetTenantCanisterIdsResult,
};

mod env;
mod management;

ic_cdk::export_candid!();
