use std::cmp::Ordering;

use crate::types::access_control::UserWithRoles;
use crate::types::documents::{Document, DocumentId};
use crate::types::organizations::{Organization, OrganizationId};
use crate::types::pagination::{
    DocumentFilterField, OrganizationFilterField, ProjectFilterField, RevisionFilterField,
    UserFilterField, WorkflowFilterField,
};
use crate::types::pagination::{
    FilterCriteria, FilterField, FilterOperator, SortCriteria, SortOrder,
};
use crate::types::projects::{Project, ProjectId};
use crate::types::revisions::{Revision, RevisionId};
use crate::types::users::{User, UserId};
use crate::types::workflows::{Workflow, WorkflowId};

pub trait Filterable {
    fn matches(&self, criteria: &FilterCriteria) -> bool;
}

pub trait Sortable {
    fn compare(&self, other: &Self, criteria: &SortCriteria) -> Ordering;
}

impl Filterable for Document {
    fn matches(&self, criteria: &FilterCriteria) -> bool {
        match &criteria.field {
            FilterField::Document(DocumentFilterField::Id) => {
                let criteria_value = criteria.value.parse::<DocumentId>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.id == criteria_value,
                    _ => false,
                }
            }

            FilterField::Document(DocumentFilterField::Title) => match criteria.operator {
                FilterOperator::Equals => self.title == criteria.value,
                FilterOperator::Contains => self.title.contains(&criteria.value),
                _ => false,
            },

            FilterField::Document(DocumentFilterField::CreatedAt) => {
                let parse_result = criteria.value.parse::<u64>();
                let criteria_value = parse_result.unwrap_or(0);
                match criteria.operator {
                    FilterOperator::GreaterThan => self.created_at > criteria_value,
                    FilterOperator::LessThan => self.created_at < criteria_value,
                    FilterOperator::Equals => self.created_at == criteria_value,
                    _ => false,
                }
            }

            FilterField::Document(DocumentFilterField::ProjectId) => {
                let parse_result = criteria.value.parse::<ProjectId>();
                let criteria_value = parse_result.unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.project_id == criteria_value,
                    _ => false,
                }
            }

            FilterField::Document(DocumentFilterField::Version) => {
                let parse_result = criteria.value.parse::<u8>();
                let criteria_value = parse_result.unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.version == criteria_value,
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
            FilterField::User(UserFilterField::Id) => {
                let parsed_value = criteria.value.parse::<UserId>().ok();
                match (criteria.operator.clone(), parsed_value) {
                    (FilterOperator::Equals, Some(value)) => self.id == value,
                    (FilterOperator::Equals, None) => false,
                    _ => self.id.to_string() != criteria.value,
                }
            }
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

impl Filterable for UserWithRoles {
    fn matches(&self, criteria: &FilterCriteria) -> bool {
        match &criteria.field {
            FilterField::User(UserFilterField::Id) => {
                let parsed_value = criteria.value.parse::<UserId>().ok();
                match (criteria.operator.clone(), parsed_value) {
                    (FilterOperator::Equals, Some(value)) => self.user.id == value,
                    (FilterOperator::Equals, None) => false,
                    _ => self.user.id.to_string() != criteria.value,
                }
            }
            FilterField::User(UserFilterField::FirstName) => match criteria.operator {
                FilterOperator::Equals => self.user.first_name == criteria.value,
                FilterOperator::Contains => self.user.first_name.contains(&criteria.value),
                _ => false,
            },
            FilterField::User(UserFilterField::LastName) => match criteria.operator {
                FilterOperator::Equals => self.user.last_name == criteria.value,
                FilterOperator::Contains => self.user.last_name.contains(&criteria.value),
                _ => false,
            },
            _ => false,
        }
    }
}

impl Filterable for Revision {
    fn matches(&self, criteria: &FilterCriteria) -> bool {
        match &criteria.field {
            FilterField::Revision(RevisionFilterField::Id) => {
                let parse_result = criteria.value.parse::<RevisionId>();
                let criteria_value = parse_result.unwrap_or(0);

                match criteria.operator {
                    FilterOperator::Equals => self.id == criteria_value,
                    _ => false,
                }
            }
            FilterField::Revision(RevisionFilterField::CreatedAt) => {
                let parse_result = criteria.value.parse::<u64>();
                let criteria_value = parse_result.unwrap_or(0);
                match criteria.operator {
                    FilterOperator::GreaterThan => self.created_at > criteria_value,
                    FilterOperator::LessThan => self.created_at < criteria_value,
                    FilterOperator::Equals => self.created_at == criteria_value,
                    _ => false,
                }
            }
            FilterField::Revision(RevisionFilterField::DocumentId) => {
                let parse_result = criteria.value.parse::<DocumentId>();

                let criteria_value = parse_result.unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.document_id == criteria_value,
                    _ => false,
                }
            }
            FilterField::Revision(RevisionFilterField::ProjectId) => {
                let parse_result = criteria.value.parse::<ProjectId>();
                let criteria_value = parse_result.unwrap_or(0);

                match criteria.operator {
                    FilterOperator::Equals => self.project_id == criteria_value,
                    _ => false,
                }
            }
            FilterField::Revision(RevisionFilterField::Version) => {
                let parse_result = criteria.value.parse::<u8>();

                let criteria_value = parse_result.unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.version == criteria_value,
                    _ => false,
                }
            }
            _ => false,
        }
    }
}

impl Filterable for Organization {
    fn matches(&self, criteria: &FilterCriteria) -> bool {
        match &criteria.field {
            FilterField::Organization(OrganizationFilterField::Id) => {
                let criteria_value = criteria.value.parse::<OrganizationId>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.id == criteria_value,
                    _ => false,
                }
            }
            FilterField::Organization(OrganizationFilterField::CreatedAt) => {
                let criteria_value = criteria.value.parse::<u64>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::GreaterThan => self.created_at > criteria_value,
                    FilterOperator::LessThan => self.created_at < criteria_value,
                    FilterOperator::Equals => self.created_at == criteria_value,
                    _ => false,
                }
            }
            FilterField::Organization(OrganizationFilterField::Name) => match criteria.operator {
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
            FilterField::Project(ProjectFilterField::Id) => {
                let criteria_value = criteria.value.parse::<ProjectId>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.id == criteria_value,
                    _ => false,
                }
            }
            FilterField::Project(ProjectFilterField::Members) => {
                let criteria_value = criteria.value.parse::<UserId>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Contains => self.members.contains(&criteria_value),
                    _ => false,
                }
            }
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
            FilterField::Project(ProjectFilterField::OrganizationId) => {
                let criteria_value = criteria.value.parse::<OrganizationId>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.organizations.contains(&criteria_value),
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
            FilterField::Workflow(WorkflowFilterField::Id) => {
                let criteria_value = criteria.value.parse::<WorkflowId>().unwrap_or(0);
                match criteria.operator {
                    FilterOperator::Equals => self.id == criteria_value,
                    _ => false,
                }
            }
            FilterField::Workflow(WorkflowFilterField::Name) => match criteria.operator {
                FilterOperator::Equals => self.name == criteria.value,
                FilterOperator::Contains => self.name.contains(&criteria.value),
                _ => false,
            },
            FilterField::Workflow(WorkflowFilterField::ProjectId) => {
                let criteria_value = criteria.value.parse::<ProjectId>().unwrap_or(0);
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

impl Sortable for UserWithRoles {
    fn compare(&self, other: &Self, criteria: &SortCriteria) -> Ordering {
        let ordering = match &criteria.field {
            FilterField::User(UserFilterField::FirstName) => {
                self.user.first_name.cmp(&other.user.first_name)
            }
            FilterField::User(UserFilterField::LastName) => {
                self.user.last_name.cmp(&other.user.last_name)
            }
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

impl Sortable for Organization {
    fn compare(&self, other: &Self, criteria: &SortCriteria) -> Ordering {
        let ordering = match &criteria.field {
            FilterField::Organization(OrganizationFilterField::CreatedAt) => {
                self.created_at.cmp(&other.created_at)
            }
            FilterField::Organization(OrganizationFilterField::Name) => self.name.cmp(&other.name),
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
            FilterField::Project(ProjectFilterField::OrganizationId) => {
                self.organizations.cmp(&other.organizations)
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
