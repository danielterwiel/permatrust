import { useCallback, useState } from 'react';

import { uploadRevisionContentInChunks } from '@/utils/chunked-revision-upload';
import type {
  ChunkedRevisionUploadOptions,
  ChunkedUploadProgress,
} from '@/utils/chunked-revision-upload';

export type FileUploadProgress = {
  fileName: string;
  fileSize: number;
  uploadedBytes: number;
  percentComplete: number;
  totalChunks: number;
  currentChunk: number;
  status: 'waiting' | 'uploading' | 'completed' | 'error';
  isChunked: boolean;
};

export type UploadProgressState = {
  isUploading: boolean;
  progress: ChunkedUploadProgress | null;
  percentComplete: number;
  error: string | null;
  fileProgress: Map<string, FileUploadProgress>; // Now keyed by file identifier
};

export function useChunkedUpload() {
  const [state, setState] = useState<UploadProgressState>({
    isUploading: false,
    progress: null,
    percentComplete: 0,
    error: null,
    fileProgress: new Map(),
  });

  const uploadWithProgress = useCallback(
    async (
      options: Omit<ChunkedRevisionUploadOptions, 'onProgress'> & {
        fileMapping?: Array<{ fileName: string; fileSize: number }>;
      },
    ) => {
      setState((prev) => ({
        isUploading: true,
        progress: null,
        percentComplete: 0,
        error: null,
        fileProgress: prev.fileProgress, // Keep existing file progress
      }));

      try {
        await uploadRevisionContentInChunks({
          ...options,
          onProgress: (progress) => {
            const percentComplete = Math.round(
              (progress.uploadedBytes / progress.totalContentSize) * 100,
            );
            setState((prev) => {
              const newFileProgress = new Map(prev.fileProgress);

              // Update individual file progress based on content index
              if (
                options.fileMapping?.[
                  progress.contentIndex - (options.startingContentIndex || 0)
                ]
              ) {
                const fileInfo =
                  options.fileMapping[
                    progress.contentIndex - (options.startingContentIndex || 0)
                  ];
                const fileKey = `${fileInfo.fileName}-${fileInfo.fileSize}`;
                const currentFileProgress = newFileProgress.get(fileKey);

                if (currentFileProgress) {
                  const filePercentComplete = Math.round(
                    ((progress.chunkId + 1) / progress.totalChunks) * 100,
                  );
                  newFileProgress.set(fileKey, {
                    ...currentFileProgress,
                    percentComplete: filePercentComplete,
                    currentChunk: progress.chunkId + 1,
                    uploadedBytes: Math.round(
                      (filePercentComplete / 100) *
                        currentFileProgress.fileSize,
                    ),
                    status:
                      filePercentComplete === 100 ? 'completed' : 'uploading',
                  });
                }
              }

              return {
                isUploading: true,
                progress,
                percentComplete,
                error: null,
                fileProgress: newFileProgress,
              };
            });
          },
        });

        setState((prev) => ({
          isUploading: false,
          progress: null,
          percentComplete: 100,
          error: null,
          fileProgress: prev.fileProgress,
        }));
      } catch (error) {
        setState((prev) => ({
          isUploading: false,
          progress: null,
          percentComplete: 0,
          error: error instanceof Error ? error.message : 'Upload failed',
          fileProgress: prev.fileProgress,
        }));
        throw error;
      }
    },
    [],
  );

  const resetProgress = useCallback(() => {
    setState({
      isUploading: false,
      progress: null,
      percentComplete: 0,
      error: null,
      fileProgress: new Map(),
    });
  }, []);

  const initializeFileProgress = useCallback((files: Array<File>) => {
    setState((prev) => {
      const newFileProgress = new Map<string, FileUploadProgress>();
      for (const file of files) {
        const fileKey = `${file.name}-${file.size}`;
        const isChunked = file.size > 512 * 1024; // MAX_DIRECT_UPLOAD_SIZE
        newFileProgress.set(fileKey, {
          fileName: file.name,
          fileSize: file.size,
          uploadedBytes: 0,
          percentComplete: 0,
          totalChunks: isChunked ? Math.ceil(file.size / 1048576) : 1, // 1MB chunks or single upload
          currentChunk: 0,
          status: 'waiting',
          isChunked,
        });
      }
      return {
        ...prev,
        fileProgress: newFileProgress,
      };
    });
  }, []);

  const updateFileProgress = useCallback(
    (
      fileName: string,
      fileSize: number,
      update: Partial<FileUploadProgress>,
    ) => {
      setState((prev) => {
        const fileKey = `${fileName}-${fileSize}`;
        const newFileProgress = new Map(prev.fileProgress);
        const currentProgress = newFileProgress.get(fileKey);
        if (currentProgress) {
          newFileProgress.set(fileKey, {
            ...currentProgress,
            ...update,
          });
        }
        return {
          ...prev,
          fileProgress: newFileProgress,
        };
      });
    },
    [],
  );

  return {
    ...state,
    uploadWithProgress,
    resetProgress,
    initializeFileProgress,
    updateFileProgress,
  };
}
