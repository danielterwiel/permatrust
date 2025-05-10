mod methods;
mod state;

use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};
use serde::{Deserialize, Serialize};
use shared::traits::workflows::WorkflowGraphExt;
use shared::types::errors::AppError;
use shared::types::pagination::PaginationInput;
use shared::types::workflows::{
    CreateWorkflowInput, Edge, EventId, StateId, Workflow, WorkflowGraph, WorkflowId,
};
use std::collections::HashMap;
