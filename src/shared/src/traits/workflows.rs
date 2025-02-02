use crate::types::workflows::Workflow;
use crate::types::workflows::{Edge, EventId, StateId, WorkflowGraph};
use candid::{Decode, Encode};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use petgraph::stable_graph::StableDiGraph;
use std::borrow::Cow;

const MAX_VALUE_SIZE: u32 = 32_768;

impl Storable for Workflow {
    fn to_bytes(&self) -> std::borrow::Cow<[u8]> {
        Cow::Owned(Encode!(self).unwrap())
    }

    fn from_bytes(bytes: std::borrow::Cow<[u8]>) -> Self {
        Decode!(bytes.as_ref(), Self).unwrap()
    }

    const BOUND: Bound = Bound::Bounded {
        max_size: MAX_VALUE_SIZE,
        is_fixed_size: false,
    };
}

pub trait WorkflowGraphExt {
    fn from_json(json_str: &str) -> std::result::Result<WorkflowGraph, String>;
    fn to_graph(&self) -> StableDiGraph<StateId, EventId>;
}

impl WorkflowGraphExt for WorkflowGraph {
    fn from_json(json_str: &str) -> std::result::Result<Self, String> {
        // Parse the JSON string into WorkflowGraph
        serde_json::from_str(json_str).map_err(|e| format!("JSON parse error: {}", e))
    }

    fn to_graph(&self) -> StableDiGraph<StateId, EventId> {
        let mut graph = StableDiGraph::new();
        let mut node_indices = Vec::new();

        for state in &self.nodes {
            let index = graph.add_node(state.clone());
            node_indices.push(index);
        }

        for Edge(source_idx, target_idx, event) in &self.edges {
            graph.add_edge(
                node_indices[*source_idx as usize],
                node_indices[*target_idx as usize],
                event.clone(),
            );
        }

        graph
    }
}
