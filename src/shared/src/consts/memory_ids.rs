pub mod main_canister {
    pub const IDENTITY_TENANT_MAP_MEMORY_ID: u8 = 0;
    pub const LOGS_STORAGE_MEMORY_ID: u8 = 1;
}

pub mod tenant_canister {
    pub const ORGANIZATION_MEMORY_ID: u8 = 0;
    pub const PROJECTS_MEMORY_ID: u8 = 1;
    pub const USERS_MEMORY_ID: u8 = 2;
    pub const DOCUMENTS_MEMORY_ID: u8 = 3;
    pub const WORKFLOWS_MEMORY_ID: u8 = 4;
    pub const REVISIONS_MEMORY_ID: u8 = 5;
    pub const ROLES_MEMORY_ID: u8 = 6;
    pub const USER_ROLES_MEMORY_ID: u8 = 7;
    pub const INVITES_MEMORY_ID: u8 = 8;
    pub const LOGS_STORAGE_MEMORY_ID: u8 = 9;
    pub const REVISION_CONTENT_CHUNKS_MEMORY_ID: u8 = 10;
    pub const REVISION_CONTENT_METADATA_MEMORY_ID: u8 = 11;
    pub const REVISION_CONTENT_MEMORY_ID: u8 = 12;
    pub const REVISION_CHUNK_REFS_MEMORY_ID: u8 = 13;
}

pub mod upgrade_canister {
    pub const WASM_STORAGE_MEMORY_ID: u8 = 0;
    pub const CHUNK_STORAGE_MEMORY_ID: u8 = 1;
    pub const METADATA_STORAGE_MEMORY_ID: u8 = 2;
    pub const LOGS_STORAGE_MEMORY_ID: u8 = 3;
}
