use std::borrow::Cow;

use candid::CandidType;
use ic_stable_structures::Storable;
use serde::Deserialize;

use crate::types::errors::AppError;
use crate::types::pagination::PaginationMetadata;

// Core logging types
pub type LogId = u64;

#[derive(Clone, Copy, Debug, CandidType, Deserialize, PartialEq, Ord, PartialOrd, Eq)]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
}

#[derive(Clone, Debug, CandidType, Deserialize, PartialEq, Eq, PartialOrd, Ord)]
pub enum CanisterOrigin {
    Main,
    Upgrade,
    Tenant,
}

#[derive(Clone, Debug, CandidType, Deserialize)]
pub struct LogEntry {
    pub id: u64,
    pub timestamp: u64,
    pub level: LogLevel,
    pub origin: CanisterOrigin,
    pub message: String,
}

impl Storable for LogEntry {
    fn to_bytes(&self) -> Cow<[u8]> {
        let encoded = candid::encode_one(self).expect("Failed to encode LogEntry");
        Cow::Owned(encoded)
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        candid::decode_one(&bytes).expect("Failed to decode LogEntry")
    }

    const BOUND: ic_stable_structures::storable::Bound =
        ic_stable_structures::storable::Bound::Unbounded;
}

impl std::fmt::Display for CanisterOrigin {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CanisterOrigin::Main => write!(f, "MAIN"),
            CanisterOrigin::Upgrade => write!(f, "UPGRADE"),
            CanisterOrigin::Tenant => write!(f, "TENANT"),
        }
    }
}

impl std::fmt::Display for LogLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LogLevel::Error => write!(f, "ERROR"),
            LogLevel::Warn => write!(f, "WARN"),
            LogLevel::Info => write!(f, "INFO"),
            LogLevel::Debug => write!(f, "DEBUG"),
        }
    }
}

// API types
pub type LogsResult = Result<(Vec<LogEntry>, PaginationMetadata), AppError>;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ListLogsInput {
    pub pagination: crate::types::pagination::PaginationInput,
    pub level_filter: Option<LogLevel>,
    pub origin_filter: Option<CanisterOrigin>,
}

pub type ListLogsResult = LogsResult;
