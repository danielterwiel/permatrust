use candid::CandidType;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Debug)]
pub struct TenantInitArgs {
    pub company_name: String,
}
