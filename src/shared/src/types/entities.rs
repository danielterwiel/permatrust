use candid::CandidType;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum Entity {
    User,
    UserWithRoles,
    Document,
    Revision,
    Organization,
    Project,
    Workflow,
}
