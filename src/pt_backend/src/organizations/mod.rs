mod methods;
mod state;

use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use shared::types::errors::AppError;
use shared::types::organizations::{Organization, OrganizationId, OrganizationResult};
use shared::types::pagination::{PaginationInput, PaginationMetadata};
use shared::types::users::UserId;
