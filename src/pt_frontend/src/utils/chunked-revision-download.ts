import { api } from '@/api';

export type ChunkedDownloadProgress = {
  chunkId: number;
  totalChunks: number;
  downloadedBytes: number;
  totalBytes: number;
  percentComplete: number;
};

export type ChunkedDownloadOptions = {
  contentId: bigint;
  totalChunks: number;
  totalSize: number;
  onProgress?: (progress: ChunkedDownloadProgress) => void;
};

/**
 * Download chunked content by fetching all chunks and assembling them in order
 */
export async function downloadChunkedContent({
  contentId,
  totalChunks,
  totalSize,
  onProgress,
}: ChunkedDownloadOptions): Promise<Uint8Array> {
  let downloadedBytes = 0;

  // Download all chunks in parallel for better performance
  const chunkPromises = Array.from({ length: totalChunks }, async (_, chunkId): Promise<{ chunkId: number; data: Uint8Array }> => {
    try {
      const result = await api.tenant.download_revision_content({
        content_id: contentId,
        chunk_id: [chunkId],
      });

      const chunkData = new Uint8Array(result);
      downloadedBytes += chunkData.length;

      onProgress?.({
        chunkId,
        totalChunks,
        downloadedBytes,
        totalBytes: totalSize,
        percentComplete: Math.round((downloadedBytes / totalSize) * 100),
      });

      return { chunkId, data: chunkData };
    } catch (error) {
      throw new Error(`Failed to download chunk ${chunkId}: ${error}`);
    }
  });

  // Wait for all chunks to complete
  const chunkResults = await Promise.all(chunkPromises);
  
  // Sort chunks by ID to ensure correct order
  chunkResults.sort((a, b) => a.chunkId - b.chunkId);
  
  // Calculate total size for assembled content
  const totalAssembledSize = chunkResults.reduce((sum, chunk) => sum + chunk.data.length, 0);
  
  // Assemble chunks into single array
  const assembledData = new Uint8Array(totalAssembledSize);
  let offset = 0;
  
  for (const chunk of chunkResults) {
    assembledData.set(chunk.data, offset);
    offset += chunk.data.length;
  }
  
  return assembledData;
}

/**
 * Trigger browser download for assembled content
 */
export function triggerDownload(data: Uint8Array, fileName: string) {
  const blob = new Blob([data]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
