use crate::logs::logs_manager::LogsManager;
use ic_cdk_macros::query;
use shared::types::logs::{ListLogsInput, ListLogsResult};

#[query]
pub fn list_logs(input: ListLogsInput) -> ListLogsResult {
    LogsManager::list_logs(input)
}
