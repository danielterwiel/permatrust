use candid::CandidType;
use serde::Deserialize;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum Entity {
    User,
    Document,
    Revision,
    Organization,
    Project,
    Workflow,
}
