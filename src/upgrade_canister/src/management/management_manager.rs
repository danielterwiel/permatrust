use ic_stable_structures::memory_manager::{MemoryId, MemoryManager, VirtualMemory};
use shared::consts::memory_ids::upgrade_canister::{
    CHUNK_STORAGE_MEMORY_ID, METADATA_STORAGE_MEMORY_ID, WASM_STORAGE_MEMORY_ID,
};
use shared::types::management::{WasmChunk, WasmMetadata};
use shared::{log_debug, log_error, log_info};
use std::cell::RefCell;

use ic_stable_structures::{DefaultMemoryImpl, StableBTreeMap};

type Memory = VirtualMemory<DefaultMemoryImpl>;

type WasmStore = StableBTreeMap<u32, Vec<u8>, Memory>;
type ChunkStore = StableBTreeMap<String, Vec<u8>, Memory>; // key: "version_chunkid"
type MetadataStore = StableBTreeMap<u32, WasmMetadata, Memory>;

thread_local! {
    static WASM_MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static WASM_STORAGE: RefCell<WasmStore> = RefCell::new(
        StableBTreeMap::init(
            WASM_MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(WASM_STORAGE_MEMORY_ID)))
        )
    );

    // For chunked uploads - temporary storage
    static CHUNK_STORAGE: RefCell<ChunkStore> = RefCell::new(
        StableBTreeMap::init(
            WASM_MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(CHUNK_STORAGE_MEMORY_ID)))
        )
    );

    static METADATA_STORAGE: RefCell<MetadataStore> = RefCell::new(
        StableBTreeMap::init(
            WASM_MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(METADATA_STORAGE_MEMORY_ID)))
        )
    );
}

pub struct ManagementManager;

impl ManagementManager {
    pub fn store_wasm_module(version: u32, wasm_bytes: Vec<u8>) -> Result<(), String> {
        if wasm_bytes.is_empty() {
            return Err("Wasm bytes cannot be empty.".to_string());
        }

        WASM_STORAGE.with(|storage| {
            storage.borrow_mut().insert(version, wasm_bytes);
        });

        log_info!("Stored wasm module version: {}", version);
        Ok(())
    }

    pub fn get_wasm_by_version(version: u32) -> Option<Vec<u8>> {
        WASM_STORAGE.with(|storage| {
            // Retrieve the wasm bytes. `get` returns a Cow-like structure for values,
            // so we clone it to return an owned Vec<u8>.
            storage.borrow().get(&version)
        })
    }

    pub fn get_all_wasm_versions() -> Vec<u32> {
        WASM_STORAGE.with(|storage| {
            storage
                .borrow()
                .iter()
                .map(|(version, _)| version)
                .collect()
        })
    }

    pub fn store_wasm_chunk(version: u32, chunk: WasmChunk) -> Result<(), String> {
        if chunk.data.is_empty() {
            return Err("Chunk data cannot be empty.".to_string());
        }

        // Debug: log what we received
        log_debug!(
            "Received chunk {} for version {}, length: {}, first 8 bytes: {:?}",
            chunk.chunk_id,
            version,
            chunk.data.len(),
            if chunk.data.len() >= 8 {
                &chunk.data[0..8]
            } else {
                &chunk.data[..]
            }
        );

        let chunk_key = format!("{}_{}", version, chunk.chunk_id);

        // Store the chunk data directly (Candid should have already decoded hex/base64)
        CHUNK_STORAGE.with(|storage| {
            storage.borrow_mut().insert(chunk_key, chunk.data);
        });

        // Update or create metadata
        let metadata = WasmMetadata {
            version,
            total_chunks: chunk.total_chunks,
            total_size: 0, // Will be calculated when complete
            is_complete: false,
        };

        METADATA_STORAGE.with(|storage| {
            storage.borrow_mut().insert(version, metadata);
        });

        log_info!(
            "Stored chunk {} of {} for version {}",
            chunk.chunk_id,
            chunk.total_chunks,
            version
        );
        Ok(())
    }

    pub fn get_wasm_chunk(version: u32, chunk_id: u32) -> Option<WasmChunk> {
        let chunk_key = format!("{}_{}", version, chunk_id);

        // First try to get from temporary chunk storage
        let chunk_result = CHUNK_STORAGE.with(|storage| {
            storage.borrow().get(&chunk_key).map(|data| {
                let metadata =
                    METADATA_STORAGE.with(|meta_storage| meta_storage.borrow().get(&version));

                if let Some(meta) = metadata {
                    WasmChunk {
                        chunk_id,
                        total_chunks: meta.total_chunks,
                        data,
                    }
                } else {
                    // Fallback - shouldn't happen in normal operation
                    WasmChunk {
                        chunk_id,
                        total_chunks: 1,
                        data,
                    }
                }
            })
        });

        // If not found in chunks, try to get from assembled WASM and re-chunk it
        if chunk_result.is_none() {
            if let Some(complete_wasm) = Self::get_wasm_by_version(version) {
                let chunk_size = 1048576; // 1MB chunks same as upload
                let total_chunks = complete_wasm.len().div_ceil(chunk_size);

                if (chunk_id as usize) < total_chunks {
                    let start = chunk_id as usize * chunk_size;
                    let end = std::cmp::min(start + chunk_size, complete_wasm.len());
                    let chunk_data = complete_wasm[start..end].to_vec();

                    return Some(WasmChunk {
                        chunk_id,
                        total_chunks: total_chunks as u32,
                        data: chunk_data,
                    });
                }
            }
        }

        chunk_result
    }

    pub fn finish_wasm_upload(version: u32) -> Result<(), String> {
        // Get metadata to check if all chunks are present
        let metadata = METADATA_STORAGE.with(|storage| storage.borrow().get(&version));

        let metadata = metadata.ok_or("No metadata found for this version")?;

        // Collect all chunks
        let mut chunks = Vec::new();
        for chunk_id in 0..metadata.total_chunks {
            let chunk_key = format!("{}_{}", version, chunk_id);
            let chunk_data = CHUNK_STORAGE.with(|storage| storage.borrow().get(&chunk_key));

            match chunk_data {
                Some(data) => chunks.push((chunk_id, data)),
                None => {
                    return Err(format!(
                        "Missing chunk {} for version {}",
                        chunk_id, version
                    ))
                }
            }
        }

        // Sort chunks by ID and concatenate
        chunks.sort_by_key(|(id, _)| *id);
        let mut wasm_bytes = Vec::new();
        for (_, data) in chunks {
            wasm_bytes.extend(data);
        }

        // Validate WASM format before storing
        log_debug!(
            "Assembled WASM for version {}, total size: {} bytes, first 8 bytes: {:?}",
            version,
            wasm_bytes.len(),
            if wasm_bytes.len() >= 8 {
                &wasm_bytes[0..8]
            } else {
                &wasm_bytes[..]
            }
        );

        if wasm_bytes.len() < 4 || &wasm_bytes[0..4] != b"\0asm" {
            let error_msg = format!(
                "Invalid WASM format after assembly. Expected [0, 97, 115, 109], got {:?}",
                if wasm_bytes.len() >= 4 {
                    &wasm_bytes[0..4]
                } else {
                    &wasm_bytes[..]
                }
            );
            log_error!("{}", &error_msg);
            return Err(error_msg);
        }

        // Store the complete WASM module
        WASM_STORAGE.with(|storage| {
            storage.borrow_mut().insert(version, wasm_bytes.clone());
        });

        // Update metadata
        let updated_metadata = WasmMetadata {
            version,
            total_chunks: metadata.total_chunks,
            total_size: wasm_bytes.len() as u64,
            is_complete: true,
        };

        METADATA_STORAGE.with(|storage| {
            storage.borrow_mut().insert(version, updated_metadata);
        });

        // Clean up chunks from temporary storage
        for chunk_id in 0..metadata.total_chunks {
            let chunk_key = format!("{}_{}", version, chunk_id);
            CHUNK_STORAGE.with(|storage| {
                storage.borrow_mut().remove(&chunk_key);
            });
        }

        log_info!(
            "Completed WASM upload for version {}, total size: {} bytes",
            version,
            wasm_bytes.len()
        );
        Ok(())
    }
}
