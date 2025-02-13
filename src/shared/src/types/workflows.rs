use candid::CandidType;
use serde::Deserialize;

use crate::types::errors::AppError;
use crate::types::pagination::PaginationMetadata;
use crate::types::projects::ProjectId;

pub type WorkflowId = u32;
pub type StateId = String;
pub type EventId = String;
pub type WorkflowIdResult = Result<WorkflowId, AppError>;
pub type WorkflowResult = Result<Workflow, AppError>;
pub type PaginatedWorkflowsResult = Result<(Vec<Workflow>, PaginationMetadata), AppError>;

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

// Inputs

#[derive(CandidType, Deserialize)]
pub struct CreateWorkflowInput {
    pub initial_state: StateId,
    pub name: String,
    pub graph_json: String,
    pub project_id: ProjectId,
}

#[derive(CandidType, Deserialize)]
pub struct WorkflowIdInput {
    pub id: WorkflowId,
}

#[derive(candid::CandidType, serde::Deserialize)]
pub struct ExecuteWorkflowInput {
    pub workflow_id: WorkflowId,
    pub event_id: EventId,
}

// Results
#[derive(CandidType, Deserialize)]
pub enum CreateWorkflowResult {
    Ok(WorkflowId),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ListWorkflowsResult {
    Ok((Vec<Workflow>, PaginationMetadata)),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetWorkflowResult {
    Ok(Workflow),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ExecuteWorkflowResult {
    Ok(()),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetWorkflowStateResult {
    Ok(StateId),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetWorkflowDefinitionResult {
    Ok(WorkflowGraph),
    Err(AppError),
}
