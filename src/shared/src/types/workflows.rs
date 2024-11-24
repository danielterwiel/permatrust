use candid::CandidType;
use serde::Deserialize;

use crate::types::errors::AppError;
use crate::types::pagination::PaginationMetadata;
use crate::types::projects::ProjectId;

pub type WorkflowId = u64;
pub type StateId = String;
pub type EventId = String;

#[derive(CandidType, Deserialize)]
pub struct CreateWorkflowInput {
    pub initial_state: StateId,
    pub name: String,
    pub graph_json: String,
    pub project_id: ProjectId,
}

#[derive(CandidType, Deserialize)]
pub enum WorkflowIdResult {
    Ok(WorkflowId),
    Err(AppError),
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Edge(pub u64, pub u64, pub EventId);

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct WorkflowGraph {
    pub edges: Vec<Edge>,
    pub nodes: Vec<StateId>,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Workflow {
    pub id: WorkflowId,
    pub current_state: StateId,
    pub name: String,
    pub graph: WorkflowGraph,
    pub project_id: ProjectId,
}

#[derive(CandidType, Deserialize)]
pub enum WorkflowResult {
    Ok(Workflow),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum PaginatedWorkflowsResult {
    Ok(Vec<Workflow>, PaginationMetadata),
    Err(AppError),
}
