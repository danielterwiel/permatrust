use crate::types::users::{User, UserId};
use candid::{Decode, Encode, Principal};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use std::borrow::Cow;

const MAX_VALUE_SIZE: u32 = 32_768;

impl Storable for User {
    fn to_bytes(&self) -> std::borrow::Cow<'_, [u8]> {
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

impl User {
    pub fn new(
        id: UserId,
        principals: Vec<Principal>,
        first_name: String,
        last_name: String,
    ) -> Self {
        Self {
            id,
            first_name,
            last_name,
            principals,
            roles: Vec::new(),
        }
    }
}
