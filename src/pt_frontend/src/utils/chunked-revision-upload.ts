import type {
  RevisionContent,
  RevisionContentChunk,
} from '@/declarations/tenant_canister/tenant_canister.did';

import { api } from '@/api';

const CHUNK_SIZE = 1048576; // 1MB chunks
const MAX_DIRECT_UPLOAD_SIZE = 512 * 1024; // 512KB - send smaller content directly

export type ChunkedUploadProgress = {
  contentIndex: number;
  chunkId: number;
  totalChunks: number;
  totalContentSize: number;
  uploadedBytes: number;
};

export type ChunkedRevisionUploadOptions = {
  revisionId: bigint;
  contents: Array<RevisionContent>;
  startingContentIndex?: number;
  onProgress?: (progress: ChunkedUploadProgress) => void;
};

/**
 * Upload revision content using chunking for large files
 * Following the same pattern as the bash WASM upload script
 */
export async function uploadRevisionContentInChunks({
  revisionId,
  contents,
  startingContentIndex = 0,
  onProgress,
}: ChunkedRevisionUploadOptions): Promise<void> {
  const totalContentSize = contents.reduce((sum, content) => {
    if (content.content_data.length === 0) {
      // Reference to existing content, no size to add
      return sum;
    }
    const contentData = content.content_data[0];
    if ('Direct' in contentData) {
      return sum + contentData.Direct.bytes.length;
    }
    return sum + Number(contentData.Chunked.total_size);
  }, 0);
  let uploadedBytes = 0;

  for (let i = 0; i < contents.length; i++) {
    const contentIndex = startingContentIndex + i;
    const content = contents[i];

    // Skip content that's a reference to existing content
    if (content.content_data.length === 0) {
      continue;
    }

    const contentData = content.content_data[0];
    // Only process Direct content for chunking (Chunked content is already processed)
    if (!('Direct' in contentData)) {
      continue; // Skip already chunked content
    }

    const contentBytes = new Uint8Array(contentData.Direct.bytes);

    // Skip small content that can be uploaded directly
    if (contentBytes.length <= MAX_DIRECT_UPLOAD_SIZE) {
      uploadedBytes += contentBytes.length;
      onProgress?.({
        contentIndex,
        chunkId: 0,
        totalChunks: 1,
        totalContentSize,
        uploadedBytes,
      });
      continue;
    }

    // Calculate total chunks for this content
    const totalChunks = Math.ceil(contentBytes.length / CHUNK_SIZE);

    for (let chunkId = 0; chunkId < totalChunks; chunkId++) {
      const start = chunkId * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, contentBytes.length);
      const chunkData = contentBytes.slice(start, end);

      const chunk: RevisionContentChunk = {
        chunk_id: chunkId,
        total_chunks: totalChunks,
        data: Array.from(chunkData),
        checksum: [], // TODO: Implement checksum calculation
      };

      // Upload chunk using the same pattern as WASM upload
      // The API wrapper will throw an error if the result is Err, so we can just await
      await api.tenant.store_revision_content_chunk({
        revision_id: revisionId,
        content_index: contentIndex,
        chunk,
        content_type: content.content_type,
        file_name:
          content.file_name.length > 0 ? [content.file_name[0] ?? ''] : [],
      });

      uploadedBytes += chunkData.length;
      onProgress?.({
        contentIndex,
        chunkId,
        totalChunks,
        totalContentSize,
        uploadedBytes,
      });
    }

    // Finish upload for this content (assembles chunks)
    // The API wrapper will throw an error if the result is Err, so we can just await
    await api.tenant.finish_revision_content_upload({
      revision_id: revisionId,
      content_index: contentIndex,
    });
  }
}

/**
 * Separate small and large content for different upload strategies
 */
export function separateContentBySize(contents: Array<RevisionContent>): {
  smallContent: Array<RevisionContent>;
  largeContent: Array<RevisionContent>;
} {
  const smallContent: Array<RevisionContent> = [];
  const largeContent: Array<RevisionContent> = [];

  for (const content of contents) {
    if (content.content_data.length === 0) {
      // Reference to existing content, consider as small (no upload needed)
      smallContent.push(content);
      continue;
    }

    const contentData = content.content_data[0];
    if ('Direct' in contentData) {
      if (contentData.Direct.bytes.length <= MAX_DIRECT_UPLOAD_SIZE) {
        smallContent.push(content);
      } else {
        largeContent.push(content);
      }
    } else {
      // Chunked content is considered large
      largeContent.push(content);
    }
  }

  return { smallContent, largeContent };
}

/**
 * Calculate total size and chunk count for progress tracking
 */
export function calculateUploadMetrics(contents: Array<RevisionContent>): {
  totalSize: number;
  totalChunks: number;
  largeContentCount: number;
} {
  let totalSize = 0;
  let totalChunks = 0;
  let largeContentCount = 0;

  for (const content of contents) {
    if (content.content_data.length === 0) {
      // Reference to existing content, no size or chunks to add
      continue;
    }

    const contentData = content.content_data[0];
    if ('Direct' in contentData) {
      const size = contentData.Direct.bytes.length;
      totalSize += size;
      if (size <= MAX_DIRECT_UPLOAD_SIZE) {
        totalChunks += 1;
      } else {
        largeContentCount += 1;
        totalChunks += Math.ceil(size / CHUNK_SIZE);
      }
    } else {
      const size = Number(contentData.Chunked.total_size);
      totalSize += size;
      largeContentCount += 1;
      totalChunks += contentData.Chunked.total_chunks;
    }
  }

  return { totalSize, totalChunks, largeContentCount };
}
