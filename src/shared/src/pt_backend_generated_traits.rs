use crate::pt_backend_generated::{
    Document, DocumentField, Edge, EventId, FilterCriteria, FilterOperator, Revision, SortCriteria,
    SortOrder, StateId, WorkflowGraph,
};
use petgraph::stable_graph::StableDiGraph;
use std::cmp::Ordering;

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

pub trait Filterable {
    fn matches(&self, criteria: &FilterCriteria) -> bool;
}

pub trait Sortable {
    fn compare(&self, other: &Self, criteria: &SortCriteria) -> Ordering;
}

impl Filterable for Document {
    fn matches(&self, criteria: &FilterCriteria) -> bool {
        match criteria.field {
            DocumentField::Title => match criteria.operator {
                FilterOperator::Equals => self.title == criteria.value,
                FilterOperator::Contains => self.title.contains(&criteria.value),
                _ => false,
            },
            DocumentField::CreatedAt => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::GreaterThan => self.created_at > criteria_value,
                    FilterOperator::LessThan => self.created_at < criteria_value,
                    FilterOperator::Equals => self.created_at == criteria_value,
                    _ => false,
                }
            }
            DocumentField::ProjectId => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.project == criteria_value,
                    _ => false,
                }
            }
        }
    }
}

impl Sortable for Document {
    fn compare(&self, other: &Self, criteria: &SortCriteria) -> Ordering {
        let ordering = match criteria.field {
            DocumentField::Title => self.title.cmp(&other.title),
            DocumentField::CreatedAt => self.created_at.cmp(&other.created_at),
            DocumentField::ProjectId => self.project.cmp(&other.project),
            // Handle other fields as needed
        };
        match criteria.order {
            SortOrder::Asc => ordering,
            SortOrder::Desc => ordering.reverse(),
        }
    }
}
