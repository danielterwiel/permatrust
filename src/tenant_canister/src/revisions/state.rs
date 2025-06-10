use shared::consts::memory_ids::tenant_canister::{
    REVISIONS_MEMORY_ID, REVISION_CHUNK_REFS_MEMORY_ID, REVISION_CONTENT_CHUNKS_MEMORY_ID,
    REVISION_CONTENT_MEMORY_ID, REVISION_CONTENT_METADATA_MEMORY_ID,
};
use shared::types::revisions::{
    RevisionContent, RevisionContentChunk, RevisionContentData, RevisionContentId,
    RevisionContentMetadata, RevisionContentType,
};

use super::*;
use crate::documents;
use sha2::{Digest, Sha256};
use std::cell::RefCell;
use std::sync::atomic::{AtomicU64, Ordering};

type Memory = VirtualMemory<DefaultMemoryImpl>;
type RevisionContentMetadataStore = StableBTreeMap<String, RevisionContentMetadata, Memory>; // key: "revision_id_content_index"
type RevisionContentStore = StableBTreeMap<RevisionContentId, RevisionContent, Memory>;
type RevisionContentChunkStore = StableBTreeMap<String, Vec<u8>, Memory>; // key: SHA-256 checksum -> chunk data
type ChunkReferenceStore = StableBTreeMap<String, String, Memory>; // key: "revision_id_content_index_chunk_id" -> checksum

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));

    static REVISIONS: RefCell<StableBTreeMap<RevisionId, Revision, Memory>> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(REVISIONS_MEMORY_ID))),
        )
    );

    static REVISION_CONTENT_METADATA: RefCell<RevisionContentMetadataStore> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(REVISION_CONTENT_METADATA_MEMORY_ID))),
        )
    );

    // For revision content storage
    static REVISION_CONTENT: RefCell<RevisionContentStore> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(REVISION_CONTENT_MEMORY_ID))),
        )
    );

    // Deduplicated chunk storage (content-addressable)
    static REVISION_CONTENT_CHUNKS: RefCell<RevisionContentChunkStore> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(REVISION_CONTENT_CHUNKS_MEMORY_ID))),
        )
    );

    // Chunk reference mapping
    static CHUNK_REFERENCES: RefCell<ChunkReferenceStore> = RefCell::new(
        StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(REVISION_CHUNK_REFS_MEMORY_ID))),
        )
    );

    static NEXT_REVISION_ID: AtomicU64 = const { AtomicU64::new(0) };
    static NEXT_CONTENT_ID: AtomicU64 = const { AtomicU64::new(0) };
}

pub fn get_next_id() -> RevisionId {
    NEXT_REVISION_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

pub fn get_next_content_id() -> RevisionContentId {
    NEXT_CONTENT_ID.with(|id| id.fetch_add(1, Ordering::SeqCst))
}

pub fn get_all() -> Vec<Revision> {
    REVISIONS.with(|revisions| {
        revisions
            .borrow()
            .iter()
            .map(|(_, rev)| rev.clone())
            .collect()
    })
}

// RevisionContent CRUD operations
pub fn insert_revision_content(content: RevisionContent) -> RevisionContentId {
    let content_id = content.id;
    REVISION_CONTENT.with(|store| {
        store.borrow_mut().insert(content_id, content);
    });
    content_id
}

pub fn get_revision_content_by_id(content_id: RevisionContentId) -> Option<RevisionContent> {
    REVISION_CONTENT.with(|store| store.borrow().get(&content_id))
}

pub fn list_revision_contents_by_revision_id(revision_id: RevisionId) -> Vec<RevisionContent> {
    if let Some(revision) = get_by_id(revision_id) {
        revision
            .contents
            .iter()
            .filter_map(|&content_id| get_revision_content_by_id(content_id))
            .collect()
    } else {
        vec![]
    }
}

pub fn insert(revision_id: RevisionId, revision: Revision) {
    REVISIONS.with(|revisions| {
        revisions.borrow_mut().insert(revision_id, revision);
    });
}

pub fn get_by_id(revision_id: RevisionId) -> Option<Revision> {
    REVISIONS.with(|revisions| revisions.borrow().get(&revision_id))
}

pub fn get_revision_range(
    document_id: DocumentId,
    start_index: usize,
    end_index: usize,
) -> Vec<Revision> {
    if let Some(document) = documents::get_by_id(document_id) {
        let revision_ids = &document.revisions;
        let range = if start_index <= end_index {
            start_index..=end_index
        } else {
            end_index..=start_index
        };

        let mut revs: Vec<Revision> = revision_ids[range]
            .iter()
            .filter_map(|&rev_id| get_by_id(rev_id))
            .collect();

        if start_index > end_index {
            revs.reverse();
        }

        revs
    } else {
        vec![]
    }
}

// Helper function to calculate SHA-256 checksum
fn calculate_checksum(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hex::encode(hasher.finalize())
}

// Chunking functions for revision content with deduplication
pub fn store_revision_content_chunk(
    revision_id: RevisionId,
    content_index: u32,
    mut chunk: RevisionContentChunk,
    content_type: RevisionContentType,
    file_name: Option<String>,
) -> Result<(), String> {
    if chunk.data.is_empty() {
        return Err("Chunk data cannot be empty.".to_string());
    }

    // Calculate checksum if not provided
    let checksum = if let Some(ref existing_checksum) = chunk.checksum {
        existing_checksum.clone()
    } else {
        let calculated = calculate_checksum(&chunk.data);
        chunk.checksum = Some(calculated.clone());
        calculated
    };

    let chunk_key = format!("{}_{}_{}", revision_id, content_index, chunk.chunk_id);

    // Check if this chunk content is already stored (deduplication)
    let chunk_already_exists =
        REVISION_CONTENT_CHUNKS.with(|storage| storage.borrow().contains_key(&checksum));

    if !chunk_already_exists {
        // Store the chunk data using checksum as key (content-addressable storage)
        REVISION_CONTENT_CHUNKS.with(|storage| {
            storage.borrow_mut().insert(checksum.clone(), chunk.data);
        });
    }

    // Store reference from revision chunk to checksum
    CHUNK_REFERENCES.with(|storage| {
        storage.borrow_mut().insert(chunk_key, checksum);
    });

    // Update or create metadata
    let metadata_key = format!("{}_{}", revision_id, content_index);
    let metadata = RevisionContentMetadata {
        revision_id,
        content_index,
        total_chunks: chunk.total_chunks,
        total_size: 0, // Will be calculated when complete
        content_type,
        file_name,
        is_complete: false,
    };

    REVISION_CONTENT_METADATA.with(|storage| {
        storage.borrow_mut().insert(metadata_key, metadata);
    });

    Ok(())
}

pub fn get_revision_content_chunk(
    revision_id: RevisionId,
    content_index: u32,
    chunk_id: u32,
) -> Option<RevisionContentChunk> {
    let chunk_key = format!("{}_{}_{}", revision_id, content_index, chunk_id);
    let metadata_key = format!("{}_{}", revision_id, content_index);

    // First get the checksum reference for this chunk
    let checksum = CHUNK_REFERENCES.with(|storage| storage.borrow().get(&chunk_key))?;

    // Then get the actual data using the checksum
    REVISION_CONTENT_CHUNKS.with(|storage| {
        storage.borrow().get(&checksum).map(|data| {
            let metadata = REVISION_CONTENT_METADATA
                .with(|meta_storage| meta_storage.borrow().get(&metadata_key));

            if let Some(meta) = metadata {
                RevisionContentChunk {
                    chunk_id,
                    total_chunks: meta.total_chunks,
                    data,
                    checksum: Some(checksum),
                }
            } else {
                // Fallback - shouldn't happen in normal operation
                RevisionContentChunk {
                    chunk_id,
                    total_chunks: 1,
                    data,
                    checksum: Some(checksum),
                }
            }
        })
    })
}

pub fn finish_revision_content_upload(
    revision_id: RevisionId,
    content_index: u32,
) -> Result<(), String> {
    let metadata_key = format!("{}_{}", revision_id, content_index);

    // Get metadata to check if all chunks are present
    let metadata = REVISION_CONTENT_METADATA.with(|storage| storage.borrow().get(&metadata_key));

    let metadata = metadata.ok_or("No metadata found for this content")?;

    // Collect chunk references and verify all chunks exist
    let mut chunk_sizes = Vec::new();
    for chunk_id in 0..metadata.total_chunks {
        let chunk_key = format!("{}_{}_{}", revision_id, content_index, chunk_id);

        // Get checksum reference
        let checksum = CHUNK_REFERENCES.with(|storage| storage.borrow().get(&chunk_key));

        match checksum {
            Some(checksum) => {
                // Verify the actual chunk data exists
                let data_exists = REVISION_CONTENT_CHUNKS
                    .with(|storage| storage.borrow().contains_key(&checksum));
                if !data_exists {
                    return Err(format!(
                        "Missing chunk data for checksum {} (chunk {} for revision {} content {})",
                        checksum, chunk_id, revision_id, content_index
                    ));
                }

                // Get chunk size for total calculation
                let chunk_size = REVISION_CONTENT_CHUNKS.with(|storage| {
                    storage
                        .borrow()
                        .get(&checksum)
                        .map(|data| data.len())
                        .unwrap_or(0)
                });
                chunk_sizes.push(chunk_size);
            }
            None => {
                return Err(format!(
                    "Missing chunk reference {} for revision {} content {}",
                    chunk_id, revision_id, content_index
                ))
            }
        }
    }

    // Calculate total size from chunk sizes (no need to assemble - downloads use chunks directly)
    let content_size: u64 = chunk_sizes.iter().sum::<usize>() as u64;

    // Create RevisionContent entity for chunked content
    let content_id = get_next_content_id();
    let revision_content = RevisionContent {
        id: content_id,
        file_name: metadata.file_name.clone(),
        content_type: metadata.content_type.clone(),
        content_data: Some(RevisionContentData::Chunked {
            total_size: content_size,
            total_chunks: metadata.total_chunks,
            revision_id,
            content_index,
        }),
    };

    // Store the RevisionContent entity
    insert_revision_content(revision_content);

    // Update the revision to include this content ID
    REVISIONS.with(|revisions| {
        let mut revisions_mut = revisions.borrow_mut();
        if let Some(mut revision) = revisions_mut.get(&revision_id) {
            revision.contents.push(content_id);
            revisions_mut.insert(revision_id, revision);
        }
    });

    // Update metadata to mark as complete
    let updated_metadata = RevisionContentMetadata {
        revision_id,
        content_index,
        total_chunks: metadata.total_chunks,
        total_size: content_size,
        content_type: metadata.content_type.clone(),
        file_name: metadata.file_name.clone(),
        is_complete: true,
    };

    REVISION_CONTENT_METADATA.with(|storage| {
        storage.borrow_mut().insert(metadata_key, updated_metadata);
    });

    // Keep chunk pieces for chunked content downloads
    // No cleanup needed as chunks will be used for individual downloads

    Ok(())
}

// Helper function to create RevisionContent with proper ID and file name (for direct/small content)
pub fn create_revision_content_with_metadata(
    bytes: Vec<u8>,
    content_type: RevisionContentType,
    file_name: Option<String>,
) -> RevisionContent {
    RevisionContent {
        id: get_next_content_id(),
        file_name,
        content_type,
        content_data: Some(RevisionContentData::Direct { bytes }),
    }
}
