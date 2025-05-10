use candid::CandidType;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Debug)]
pub enum AppError {
    EntityNotFound(String),
    IdentityNotFound,
    InternalError(String),
    InvalidInput(String),
    InvalidPageNumber(String),
    InvalidPageSize(String),
    InvalidStateTransition(String),
    SpawnCanister(String),
    Unauthorized,
    ValidationError(String),
    UpdateFailed(String),
}
