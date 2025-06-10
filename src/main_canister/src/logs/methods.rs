use super::state;
use ic_cdk_macros::query;
use shared::types::logs::{ListLogsInput, ListLogsResult};
use shared::utils::pagination::paginate;

#[query]
pub fn list_logs(input: ListLogsInput) -> ListLogsResult {
    let principal = ic_cdk::api::msg_caller();

    let mut logs = state::get_all_logs();

    // Apply filters
    if let Some(level_filter) = &input.level_filter {
        logs.retain(|log| log.level == *level_filter);
    }

    if let Some(origin_filter) = &input.origin_filter {
        logs.retain(|log| log.origin == *origin_filter);
    }

    // Sort by timestamp (newest first)
    logs.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

    match paginate(
        &logs,
        input.pagination.page_size,
        input.pagination.page_number,
        input.pagination.filters,
        input.pagination.sort,
    ) {
        Ok(result) => {
            shared::log_debug!(
                "log_listing: Listed logs [principal={}, page_items={}, total={}, level_filter={:?}, origin_filter={:?}]",
                principal,
                result.0.len(),
                logs.len(),
                input.level_filter,
                input.origin_filter
            );
            ListLogsResult::Ok(result)
        }
        Err(e) => {
            shared::log_warn!(
                "log_listing: Pagination failed [principal={}] - {:?}",
                principal,
                e
            );
            ListLogsResult::Err(e)
        }
    }
}
