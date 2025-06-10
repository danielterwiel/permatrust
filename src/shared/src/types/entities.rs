use candid::CandidType;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Clone, Debug, PartialEq)]
pub enum Entity {
    User,
    Document,
    Revision,
    Organization,
    Invite,
    Project,
    Workflow,
    LogEntry,
}
