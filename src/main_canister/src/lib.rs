use crate::management::types::{
    CreateCanisterTenantInput, CreateTenantCanisterResult, GetTenantCanisterIdsResult,
};

mod management;

ic_cdk::export_candid!();
