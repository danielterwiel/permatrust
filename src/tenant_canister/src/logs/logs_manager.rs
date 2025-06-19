use std::cell::RefCell;
use std::collections::VecDeque;

use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};
use shared::consts::memory_ids::tenant_canister::LOGS_STORAGE_MEMORY_ID;
use shared::traits::logs::LogStorage;
use shared::types::logs::{ListLogsInput, ListLogsResult, LogEntry};
use shared::utils::pagination::paginate;

type Memory = VirtualMemory<DefaultMemoryImpl>;
type LogsStore = StableBTreeMap<u64, LogEntry, Memory>;

const MAX_IN_MEMORY_LOGS: usize = 1000; // Keep recent logs in memory for fast access

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static LOGS_STORAGE: RefCell<LogsStore> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(LOGS_STORAGE_MEMORY_ID)))
        )
    );

    // In-memory cache for recent logs (faster access)
    static RECENT_LOGS: RefCell<VecDeque<LogEntry>> = const { RefCell::new(VecDeque::new()) };
}

pub struct TenantLogStorage;

impl LogStorage for TenantLogStorage {
    fn store_log(&self, entry: LogEntry) {
        // Store in stable storage
        LOGS_STORAGE.with(|storage| {
            storage.borrow_mut().insert(entry.id, entry.clone());
        });

        // Also keep in recent logs cache
        RECENT_LOGS.with(|recent| {
            let mut recent_logs = recent.borrow_mut();
            recent_logs.push_back(entry);

            // Keep only the most recent logs in memory
            while recent_logs.len() > MAX_IN_MEMORY_LOGS {
                recent_logs.pop_front();
            }
        });
    }
}

pub struct LogsManager;

impl LogsManager {
    pub fn get_all_logs() -> Vec<LogEntry> {
        LOGS_STORAGE.with(|storage| storage.borrow().iter().map(|(_, entry)| entry).collect())
    }

    pub fn init_log_storage() -> TenantLogStorage {
        TenantLogStorage
    }

    pub fn list_logs(input: ListLogsInput) -> ListLogsResult {
        let principal = ic_cdk::api::msg_caller();

        // Get all logs
        let mut logs = Self::get_all_logs();

        // Apply filters
        if let Some(level_filter) = &input.level_filter {
            logs.retain(|log| log.level == *level_filter);
        }

        if let Some(origin_filter) = &input.origin_filter {
            logs.retain(|log| log.origin == *origin_filter);
        }

        // Sort by timestamp (newest first)
        logs.sort_by(|a, b| b.timestamp.cmp(&a.timestamp));

        // Apply pagination
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
}
