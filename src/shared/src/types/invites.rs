use candid::CandidType;
use serde::Deserialize;

use crate::types::errors::AppError;
use crate::types::pagination::PaginationMetadata;
use crate::types::users::UserId;

pub type InviteId = u64;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Invite {
    pub id: InviteId,
    pub random: String,
    pub created_at: u64,
    pub created_by: UserId,
    pub accepted_by: Option<UserId>,
    pub accepted_at: Option<u64>,
}

#[derive(CandidType, Deserialize)]
pub enum CreateInviteResult {
    Ok(Invite),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum GetInviteResult {
    Ok(Invite),
    Err(AppError),
}

#[derive(CandidType, Deserialize)]
pub enum ListInvitesResult {
    Ok((Vec<Invite>, PaginationMetadata)),
    Err(AppError),
}
