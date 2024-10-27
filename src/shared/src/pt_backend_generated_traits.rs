use crate::pt_backend_generated::{
    Document, DocumentFilterField, Edge, EventId, FilterCriteria, FilterField, FilterOperator,
    Organisation, OrganisationFilterField, Project, ProjectFilterField, Revision,
    RevisionFilterField, SortCriteria, SortOrder, StateId, User, UserFilterField, Workflow,
    WorkflowFilterField, WorkflowGraph,
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
        match &criteria.field {
            FilterField::Document(DocumentFilterField::Title) => match criteria.operator {
                FilterOperator::Equals => self.title == criteria.value,
                FilterOperator::Contains => self.title.contains(&criteria.value),
                _ => false,
            },
            FilterField::Document(DocumentFilterField::CreatedAt) => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::GreaterThan => self.created_at > criteria_value,
                    FilterOperator::LessThan => self.created_at < criteria_value,
                    FilterOperator::Equals => self.created_at == criteria_value,
                    _ => false,
                }
            }
            FilterField::Document(DocumentFilterField::ProjectId) => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.project == criteria_value,
                    _ => false,
                }
            }
            _ => false,
        }
    }
}

impl Filterable for User {
    fn matches(&self, criteria: &FilterCriteria) -> bool {
        match &criteria.field {
            FilterField::User(UserFilterField::FirstName) => match criteria.operator {
                FilterOperator::Equals => self.first_name == criteria.value,
                FilterOperator::Contains => self.first_name.contains(&criteria.value),
                _ => false,
            },
            FilterField::User(UserFilterField::LastName) => match criteria.operator {
                FilterOperator::Equals => self.last_name == criteria.value,
                FilterOperator::Contains => self.last_name.contains(&criteria.value),
                _ => false,
            },
            _ => false,
        }
    }
}
impl Filterable for Revision {
    fn matches(&self, criteria: &FilterCriteria) -> bool {
        match &criteria.field {
            FilterField::Revision(RevisionFilterField::CreatedAt) => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::GreaterThan => self.created_at > criteria_value,
                    FilterOperator::LessThan => self.created_at < criteria_value,
                    FilterOperator::Equals => self.created_at == criteria_value,
                    _ => false,
                }
            }
            FilterField::Revision(RevisionFilterField::DocumentId) => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.document_id == criteria_value,
                    _ => false,
                }
            }
            FilterField::Revision(RevisionFilterField::ProjectId) => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.project_id == criteria_value,
                    _ => false,
                }
            }
            FilterField::Revision(RevisionFilterField::Version) => {
                let criteria_value = criteria.value.parse::<u8>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.version == criteria_value,
                    _ => false,
                }
            }
            _ => false,
        }
    }
}

impl Filterable for Organisation {
    fn matches(&self, criteria: &FilterCriteria) -> bool {
        match &criteria.field {
            FilterField::Organisation(OrganisationFilterField::CreatedAt) => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::GreaterThan => self.created_at > criteria_value,
                    FilterOperator::LessThan => self.created_at < criteria_value,
                    FilterOperator::Equals => self.created_at == criteria_value,
                    _ => false,
                }
            }
            FilterField::Organisation(OrganisationFilterField::Name) => match criteria.operator {
                FilterOperator::Equals => self.name == criteria.value,
                FilterOperator::Contains => self.name.contains(&criteria.value),
                _ => false,
            },
            _ => false,
        }
    }
}

impl Filterable for Project {
    fn matches(&self, criteria: &FilterCriteria) -> bool {
        match &criteria.field {
            FilterField::Project(ProjectFilterField::CreatedAt) => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::GreaterThan => self.created_at > criteria_value,
                    FilterOperator::LessThan => self.created_at < criteria_value,
                    FilterOperator::Equals => self.created_at == criteria_value,
                    _ => false,
                }
            }
            FilterField::Project(ProjectFilterField::Name) => match criteria.operator {
                FilterOperator::Contains => self.name.contains(&criteria.value),
                _ => false,
            },
            FilterField::Project(ProjectFilterField::OrganisationId) => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.organisations.contains(&criteria_value),
                    _ => false,
                }
            }

            _ => false,
        }
    }
}

impl Filterable for Workflow {
    fn matches(&self, criteria: &FilterCriteria) -> bool {
        match &criteria.field {
            FilterField::Workflow(WorkflowFilterField::Name) => match criteria.operator {
                FilterOperator::Equals => self.name == criteria.value,
                FilterOperator::Contains => self.name.contains(&criteria.value),
                _ => false,
            },
            FilterField::Workflow(WorkflowFilterField::ProjectId) => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.project_id == criteria_value,
                    _ => false,
                }
            }
            _ => false,
        }
    }
}

impl Sortable for Document {
    fn compare(&self, other: &Self, criteria: &SortCriteria) -> Ordering {
        let ordering = match &criteria.field {
            FilterField::Document(DocumentFilterField::Title) => self.title.cmp(&other.title),
            FilterField::Document(DocumentFilterField::CreatedAt) => {
                self.created_at.cmp(&other.created_at)
            }
            FilterField::Document(DocumentFilterField::ProjectId) => {
                self.project.cmp(&other.project)
            }
            _ => Ordering::Equal,
        };
        match criteria.order {
            SortOrder::Asc => ordering,
            SortOrder::Desc => ordering.reverse(),
        }
    }
}

impl Sortable for User {
    fn compare(&self, other: &Self, criteria: &SortCriteria) -> Ordering {
        let ordering = match &criteria.field {
            FilterField::User(UserFilterField::FirstName) => self.first_name.cmp(&other.first_name),
            FilterField::User(UserFilterField::LastName) => self.last_name.cmp(&other.last_name),
            _ => Ordering::Equal,
        };
        match criteria.order {
            SortOrder::Asc => ordering,
            SortOrder::Desc => ordering.reverse(),
        }
    }
}

impl Sortable for Revision {
    fn compare(&self, other: &Self, criteria: &SortCriteria) -> Ordering {
        let ordering = match &criteria.field {
            FilterField::Revision(RevisionFilterField::CreatedAt) => {
                self.created_at.cmp(&other.created_at)
            }
            FilterField::Revision(RevisionFilterField::DocumentId) => {
                self.document_id.cmp(&other.document_id)
            }
            FilterField::Revision(RevisionFilterField::ProjectId) => {
                self.project_id.cmp(&other.project_id)
            }
            FilterField::Revision(RevisionFilterField::Version) => self.version.cmp(&other.version),
            _ => Ordering::Equal,
        };
        match criteria.order {
            SortOrder::Asc => ordering,
            SortOrder::Desc => ordering.reverse(),
        }
    }
}

impl Sortable for Organisation {
    fn compare(&self, other: &Self, criteria: &SortCriteria) -> Ordering {
        let ordering = match &criteria.field {
            FilterField::Organisation(OrganisationFilterField::CreatedAt) => {
                self.created_at.cmp(&other.created_at)
            }
            FilterField::Organisation(OrganisationFilterField::Name) => self.name.cmp(&other.name),
            _ => Ordering::Equal,
        };
        match criteria.order {
            SortOrder::Asc => ordering,
            SortOrder::Desc => ordering.reverse(),
        }
    }
}

impl Sortable for Project {
    fn compare(&self, other: &Self, criteria: &SortCriteria) -> Ordering {
        let ordering = match &criteria.field {
            FilterField::Project(ProjectFilterField::CreatedAt) => {
                self.created_at.cmp(&other.created_at)
            }
            FilterField::Project(ProjectFilterField::Name) => self.name.cmp(&other.name),
            FilterField::Project(ProjectFilterField::OrganisationId) => {
                self.organisations.cmp(&other.organisations)
            }
            _ => Ordering::Equal,
        };
        match criteria.order {
            SortOrder::Asc => ordering,
            SortOrder::Desc => ordering.reverse(),
        }
    }
}

impl Sortable for Workflow {
    fn compare(&self, other: &Self, criteria: &SortCriteria) -> Ordering {
        let ordering = match &criteria.field {
            FilterField::Workflow(WorkflowFilterField::Name) => self.name.cmp(&other.name),
            FilterField::Workflow(WorkflowFilterField::ProjectId) => {
                self.project_id.cmp(&other.project_id)
            }
            _ => Ordering::Equal,
        };
        match criteria.order {
            SortOrder::Asc => ordering,
            SortOrder::Desc => ordering.reverse(),
        }
    }
}
