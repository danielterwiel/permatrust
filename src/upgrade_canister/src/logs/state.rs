use std::cell::RefCell;
use std::collections::VecDeque;

use ic_stable_structures::{
    memory_manager::{MemoryId, MemoryManager, VirtualMemory},
    DefaultMemoryImpl, StableBTreeMap,
};
use shared::consts::memory_ids::upgrade_canister::LOGS_STORAGE_MEMORY_ID;
use shared::logging::{Log, LogStorage};

type Memory = VirtualMemory<DefaultMemoryImpl>;
type LogsStore = StableBTreeMap<u64, Log, Memory>;

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
    static RECENT_LOGS: RefCell<VecDeque<Log>> = const { RefCell::new(VecDeque::new()) };
}

pub struct UpgradeLogStorage;

impl LogStorage for UpgradeLogStorage {
    fn store_log(&self, entry: Log) {
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

pub fn get_all_logs() -> Vec<Log> {
    LOGS_STORAGE.with(|storage| storage.borrow().iter().map(|(_, entry)| entry).collect())
}

pub fn init_log_storage() -> UpgradeLogStorage {
    UpgradeLogStorage
}
