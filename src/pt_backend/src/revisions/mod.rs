mod methods;
mod state;

use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::types::documents::DocumentId;
use shared::types::errors::AppError;
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::projects::ProjectId;
use shared::types::revisions::{Revision, RevisionId};

pub use methods::*;
