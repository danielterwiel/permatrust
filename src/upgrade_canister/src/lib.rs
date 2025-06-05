use ::shared::types::management::{
    FinishWasmUploadResult, GetAllWasmVersionsResult, GetWasmByVersionResult, GetWasmChunkInput,
    GetWasmChunkResult, StoreWasmChunkInput, StoreWasmChunkResult, StoreWasmModuleResult,
    StoreWasmUpgradeCanisterInput,
};

mod env;

mod init;

mod management;

ic_cdk::export_candid!();
