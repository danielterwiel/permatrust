/// Memory ID constants used for stable storage in canisters
///
/// These constants define the memory IDs used for each entity type's stable storage.
/// Memory IDs must be unique within each canister to prevent data corruption.
/// Each canister has its own isolated memory space, so memory IDs can start from 0 in each canister.
///
/// Main Canister Memory IDs
/// Used for managing tenant canister mappings and main canister functionality
pub mod main_canister {
    /// IDENTITY_TENANT_MAP static (MemoryId = 0)
    pub const IDENTITY_TENANT_MAP_MEMORY_ID: u8 = 0;
}

/// Tenant Canister Memory IDs
/// Used for all tenant-specific data storage within a tenant canister
pub mod tenant_canister {
    /// ORGANIZATION static (MemoryId = 0)
    pub const ORGANIZATION_MEMORY_ID: u8 = 0;

    /// PROJECTS static (MemoryId = 1)
    pub const PROJECTS_MEMORY_ID: u8 = 1;

    /// USERS static (MemoryId = 2)
    pub const USERS_MEMORY_ID: u8 = 2;

    /// DOCUMENTS static (MemoryId = 3)
    pub const DOCUMENTS_MEMORY_ID: u8 = 3;

    /// WORKFLOWS static (MemoryId = 4)
    pub const WORKFLOWS_MEMORY_ID: u8 = 4;

    /// REVISIONS static (MemoryId = 5)
    pub const REVISIONS_MEMORY_ID: u8 = 5;

    /// ROLES static (MemoryId = 6)
    pub const ROLES_MEMORY_ID: u8 = 6;

    /// USER_ROLES static (MemoryId = 7)
    pub const USER_ROLES_MEMORY_ID: u8 = 7;

    /// INVITES static (MemoryId = 8)
    pub const INVITES_MEMORY_ID: u8 = 8;
}

/// Upgrade Canister Memory IDs
/// Used for managing WASM modules and upgrade functionality
pub mod upgrade_canister {
    /// WASM_STORAGE static (MemoryId = 0)
    pub const WASM_STORAGE_MEMORY_ID: u8 = 0;

    /// CHUNK_STORAGE static (MemoryId = 1)
    pub const CHUNK_STORAGE_MEMORY_ID: u8 = 1;

    /// METADATA_STORAGE static (MemoryId = 2)
    pub const METADATA_STORAGE_MEMORY_ID: u8 = 2;
}

// Legacy constants for backward compatibility - DEPRECATED
// These will be removed in a future version
#[deprecated(
    since = "1.0.0",
    note = "Use main_canister::IDENTITY_TENANT_MAP_MEMORY_ID instead"
)]
pub const TENANT_MEMORY_ID: u8 = main_canister::IDENTITY_TENANT_MAP_MEMORY_ID;

#[deprecated(
    since = "1.0.0",
    note = "Use tenant_canister::ORGANIZATION_MEMORY_ID instead"
)]
pub const ORGANIZATION_MEMORY_ID: u8 = tenant_canister::ORGANIZATION_MEMORY_ID;

#[deprecated(
    since = "1.0.0",
    note = "Use tenant_canister::PROJECTS_MEMORY_ID instead"
)]
pub const PROJECTS_MEMORY_ID: u8 = tenant_canister::PROJECTS_MEMORY_ID;

#[deprecated(since = "1.0.0", note = "Use tenant_canister::USERS_MEMORY_ID instead")]
pub const USERS_MEMORY_ID: u8 = tenant_canister::USERS_MEMORY_ID;

#[deprecated(
    since = "1.0.0",
    note = "Use tenant_canister::DOCUMENTS_MEMORY_ID instead"
)]
pub const DOCUMENTS_MEMORY_ID: u8 = tenant_canister::DOCUMENTS_MEMORY_ID;

#[deprecated(
    since = "1.0.0",
    note = "Use tenant_canister::WORKFLOWS_MEMORY_ID instead"
)]
pub const WORKFLOWS_MEMORY_ID: u8 = tenant_canister::WORKFLOWS_MEMORY_ID;

#[deprecated(
    since = "1.0.0",
    note = "Use tenant_canister::REVISIONS_MEMORY_ID instead"
)]
pub const REVISIONS_MEMORY_ID: u8 = tenant_canister::REVISIONS_MEMORY_ID;

#[deprecated(since = "1.0.0", note = "Use tenant_canister::ROLES_MEMORY_ID instead")]
pub const ACCESS_CONTROL_ROLES_MEMORY_ID: u8 = tenant_canister::ROLES_MEMORY_ID;

#[deprecated(
    since = "1.0.0",
    note = "Use tenant_canister::USER_ROLES_MEMORY_ID instead"
)]
pub const ACCESS_CONTROL_USER_ROLES_MEMORY_ID: u8 = tenant_canister::USER_ROLES_MEMORY_ID;

#[deprecated(
    since = "1.0.0",
    note = "Use tenant_canister::INVITES_MEMORY_ID instead"
)]
pub const INVITES_MEMORY_ID: u8 = tenant_canister::INVITES_MEMORY_ID;

#[deprecated(
    since = "1.0.0",
    note = "Use upgrade_canister::WASM_STORAGE_MEMORY_ID instead"
)]
pub const TENANT_WASM_MEMORY_ID: u8 = upgrade_canister::WASM_STORAGE_MEMORY_ID;
