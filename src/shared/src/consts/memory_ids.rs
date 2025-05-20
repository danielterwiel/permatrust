/// Memory ID constants used for stable storage in canisters
///
/// These constants define the memory IDs used for each entity type's stable storage.
/// Memory IDs must be unique across the canister to prevent data corruption.
/// Organization singleton data (MemoryId = 0)
pub const ORGANIZATION_MEMORY_ID: u8 = 0;

/// Projects collection (MemoryId = 1)
pub const PROJECTS_MEMORY_ID: u8 = 1;

/// Users collection (MemoryId = 2)
pub const USERS_MEMORY_ID: u8 = 2;

/// Documents collection (MemoryId = 3)
pub const DOCUMENTS_MEMORY_ID: u8 = 3;

/// Workflows collection (MemoryId = 4)
pub const WORKFLOWS_MEMORY_ID: u8 = 4;

/// Revisions collection (MemoryId = 5)
pub const REVISIONS_MEMORY_ID: u8 = 5;

/// Access Control roles collection (MemoryId = 6)
pub const ACCESS_CONTROL_ROLES_MEMORY_ID: u8 = 6;

/// Access Control user roles collection (MemoryId = 7)
pub const ACCESS_CONTROL_USER_ROLES_MEMORY_ID: u8 = 7;

/// Invites collection (MemoryId = 8)
pub const INVITES_MEMORY_ID: u8 = 8;
