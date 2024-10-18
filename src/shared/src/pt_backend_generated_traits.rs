use crate::pt_backend_generated::{Edge, EventId, Revision, StateId, WorkflowGraph};
use petgraph::stable_graph::StableDiGraph;

#[derive(Clone, Debug)]
pub struct RevisionExt(pub Revision);

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
