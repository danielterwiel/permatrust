use candid::CandidType;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Debug)]
pub enum AppError {
    InvalidPageSize(String),
    InvalidInput(String),
    EntityNotFound(String),
    InvalidPageNumber(String),
    Unauthorized,
    InternalError(String),
}
