use crate::management::types::{
    CreateTenantCanisterInput, CreateTenantCanisterResult, GetTenantCanisterIdsResult,
};

mod management;

ic_cdk::export_candid!();
