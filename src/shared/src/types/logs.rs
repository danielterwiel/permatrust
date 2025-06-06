use candid::CandidType;
use serde::Deserialize;

use crate::logging::{CanisterOrigin, Log, LogLevel};
use crate::types::errors::AppError;
use crate::types::pagination::PaginationMetadata;

pub type LogsResult = Result<(Vec<Log>, PaginationMetadata), AppError>;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ListLogsInput {
    pub pagination: crate::types::pagination::PaginationInput,
    pub level_filter: Option<LogLevel>,
    pub origin_filter: Option<CanisterOrigin>,
}

pub type ListLogsResult = LogsResult;
