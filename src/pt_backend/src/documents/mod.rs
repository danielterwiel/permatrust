mod methods;
mod state;

use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::types::documents::{Document, DocumentId};
use shared::types::errors::AppError;
use shared::types::revisions::RevisionId;

pub use state::*;
