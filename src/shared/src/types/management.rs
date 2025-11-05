use candid::{CandidType, Principal};
use ic_stable_structures::{storable::Bound, Storable};
use serde::{Deserialize, Serialize};

use crate::types::errors::AppError;

use super::{
    organization::CreateOrganizationInput, projects::CreateProjectInput, users::CreateUserInput,
};

#[derive(CandidType, Deserialize, Debug)]
pub struct CreateTenantCanisterInput {
    pub user: CreateUserInput,
    pub organization: CreateOrganizationInput,
    pub project: CreateProjectInput,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct CreateInitTenantCanisterInput {
    pub user: CreateUserInput,
    pub organization: CreateOrganizationInput,
    pub project: CreateProjectInput,
    pub principal: Principal,
    pub main_canister_id: Principal,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct StoreWasmUpgradeCanisterInput {
    pub version: u32,
    pub wasm_bytes: Vec<u8>,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum CreateUpdateCanisterResult {
    Ok(()),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum UpgradeCanisterResult {
    Ok(()),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum StoreWasmModuleResult {
    Ok(()),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum GetWasmByVersionResult {
    Ok(Option<Vec<u8>>),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum GetAllWasmVersionsResult {
    Ok(Vec<u32>),
    Err(AppError),
}

// Chunking support for large WASM modules
#[derive(CandidType, Deserialize, Debug)]
pub struct WasmChunk {
    pub chunk_id: u32,
    pub total_chunks: u32,
    pub data: Vec<u8>,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct StoreWasmChunkInput {
    pub version: u32,
    pub chunk: WasmChunk,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct GetWasmChunkInput {
    pub version: u32,
    pub chunk_id: u32,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum StoreWasmChunkResult {
    Ok(()),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum GetWasmChunkResult {
    Ok(Option<WasmChunk>),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Debug)]
pub enum FinishWasmUploadResult {
    Ok(()),
    Err(AppError),
}

#[derive(CandidType, Serialize, Deserialize, Debug)]
pub struct WasmMetadata {
    pub version: u32,
    pub total_chunks: u32,
    pub total_size: u64,
    pub is_complete: bool,
}

impl Storable for WasmMetadata {
    fn to_bytes(&self) -> std::borrow::Cow<'_, [u8]> {
        std::borrow::Cow::Owned(candid::encode_one(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: 128, // Increased for Candid overhead
        is_fixed_size: false,
    };
}
