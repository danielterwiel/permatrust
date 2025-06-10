use crate::types::logs::LogEntry;

// Trait for log storage - implemented by each canister
pub trait LogStorage {
    fn store_log(&self, entry: LogEntry);
}
