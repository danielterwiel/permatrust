import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  DiffSourceToggleWrapper,
  ListsToggle,
  MDXEditor,
  UndoRedo,
  diffSourcePlugin,
  headingsPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import { useForm } from '@tanstack/react-form';
import type { FC } from 'react';
import { useCallback } from 'react';
import { z } from 'zod';

import { useChunkedUpload } from '@/hooks/use-chunked-upload';
import {
  calculateUploadMetrics,
  separateContentBySize,
} from '@/utils/chunked-revision-upload';
import { createZodFieldValidator } from '@/utils/create-zod-field-validator';

import { Loading } from '@/components/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as Dropzone from '@/components/ui/dropzone-primitive';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icon } from '@/components/ui/icon';
import { Progress } from '@/components/ui/progress';

import type { RevisionContent } from '@/declarations/tenant_canister/tenant_canister.did';
import type { FileWithPath } from 'react-dropzone';

import '@mdxeditor/editor/style.css';

export const contentFormSchema = z.object({
  markdown_content: z.string().min(1, {
    message: 'Content must be at least 1 character.',
  }),
  uploaded_files: z.array(z.instanceof(File)).optional(),
});

const MAX_DIRECT_UPLOAD_SIZE = 512 * 1024; // 512KB - send smaller content directly

export type ContentFormProps = {
  isSubmitting: boolean;
  onSubmit: (
    contents: Array<RevisionContent>,
    largeContents: Array<RevisionContent>,
  ) => Promise<{ revisionId: bigint } | null>;
  onSubmitComplete: () => void;
  defaultMarkdownContent?: string;
  defaultFiles?: Array<File>;
  originalRevisionContents?: Array<RevisionContent>;
  submitButtonText?: string;
  contentLabel?: string;
  contentDescription?: string;
  uploadDescription?: string;
};

export const ContentForm: FC<ContentFormProps> = ({
  isSubmitting,
  onSubmit,
  onSubmitComplete,
  defaultMarkdownContent = '# Hello world',
  defaultFiles = [],
  originalRevisionContents,
  submitButtonText = 'Submit',
  contentLabel = 'Content',
  contentDescription = 'Write your content here.',
  uploadDescription = 'Upload additional files to include.',
}) => {
  const uploadProgress = useChunkedUpload();

  const form = useForm({
    defaultValues: {
      markdown_content: defaultMarkdownContent,
      uploaded_files: defaultFiles,
    },
    onSubmit: async ({ value }) => {
      // Initialize progress tracking for all files
      if (value.uploaded_files.length > 0) {
        uploadProgress.initializeFileProgress(value.uploaded_files);
      }

      const contents: Array<RevisionContent> = [];

      // Add markdown content (usually small) - optimize for unchanged content
      if (value.markdown_content.trim()) {
        const originalMarkdownContent = originalRevisionContents?.find(
          (content) => 'Markdown' in content.content_type,
        );

        // Check if markdown content is unchanged
        let isMarkdownUnchanged = false;
        if (
          originalMarkdownContent &&
          originalMarkdownContent.content_data.length > 0
        ) {
          try {
            const originalContentData = originalMarkdownContent.content_data[0];
            if (!originalContentData) {
              throw new Error('Expected content data to be present');
            }
            let originalBytes: Uint8Array;

            if ('Direct' in originalContentData) {
              originalBytes = new Uint8Array(originalContentData.Direct.bytes);
            } else {
              // For chunked content, we'd need to download it to compare
              // For now, assume it's different if it's chunked
              originalBytes = new Uint8Array();
            }

            const originalText = new TextDecoder().decode(originalBytes);
            isMarkdownUnchanged = originalText === value.markdown_content;
          } catch (error) {
            console.warn(
              'Could not compare markdown content, treating as changed:',
              error,
            );
          }
        }

        if (isMarkdownUnchanged && originalMarkdownContent) {
          // Content hasn't changed - reference the existing content
          contents.push({
            id: originalMarkdownContent.id,
            file_name: originalMarkdownContent.file_name,
            content_data: [], // Empty array represents None - reference existing content
            content_type: originalMarkdownContent.content_type,
          });
        } else {
          // Content has changed - send new content
          const markdownBytes = new TextEncoder().encode(
            value.markdown_content,
          );
          contents.push({
            id: 0n, // Will be assigned by backend
            file_name: [],
            content_data: [{ Direct: { bytes: Array.from(markdownBytes) } }], // Wrap in array (Some)
            content_type: { Markdown: null },
          });
        }
      }

      // Add uploaded files and track progress - optimize for unchanged files
      if (value.uploaded_files.length > 0) {
        for (const file of value.uploaded_files) {
          // Check if this file exists in original contents and is unchanged
          const originalFileContent = originalRevisionContents?.find(
            (content) =>
              'Upload' in content.content_type &&
              content.file_name.length > 0 &&
              content.file_name[0] === file.name,
          );

          let isFileUnchanged = false;
          if (
            originalFileContent &&
            originalFileContent.content_data.length > 0
          ) {
            try {
              const originalContentData = originalFileContent.content_data[0];
              if (!originalContentData) {
                throw new Error('Expected content data to be present');
              }
              let originalSize: number;

              if ('Direct' in originalContentData) {
                originalSize = originalContentData.Direct.bytes.length;
              } else {
                originalSize = Number(originalContentData.Chunked.total_size);
              }

              // Simple check: if name and size match, assume unchanged
              // TODO: Could add checksum comparison for better accuracy
              isFileUnchanged = originalSize === file.size;
            } catch (error) {
              console.warn(
                'Could not compare file content, treating as changed:',
                error,
              );
            }
          }

          if (isFileUnchanged && originalFileContent) {
            // File hasn't changed - reference the existing content
            contents.push({
              id: originalFileContent.id,
              file_name: originalFileContent.file_name,
              content_data: [], // Empty array represents None - reference existing content
              content_type: originalFileContent.content_type,
            });

            // Mark as completed immediately since we're not uploading
            uploadProgress.updateFileProgress(file.name, file.size, {
              status: 'completed',
              percentComplete: 100,
              uploadedBytes: file.size,
            });
          } else {
            // File has changed or is new - upload new content
            // Update progress: starting upload
            uploadProgress.updateFileProgress(file.name, file.size, {
              status: 'uploading',
              percentComplete: 0,
            });

            const fileBytes = new Uint8Array(await file.arrayBuffer());
            contents.push({
              id: 0n, // Will be assigned by backend
              file_name: [file.name],
              content_data: [{ Direct: { bytes: Array.from(fileBytes) } }], // Wrap in array (Some)
              content_type: { Upload: null },
            });

            // Update progress: file processed (for small files this completes them)
            if (file.size <= MAX_DIRECT_UPLOAD_SIZE) {
              uploadProgress.updateFileProgress(file.name, file.size, {
                status: 'completed',
                percentComplete: 100,
                uploadedBytes: file.size,
              });
            }
          }
        }
      }

      // Separate content by size for different upload strategies
      const { smallContent, largeContent } = separateContentBySize(contents);

      // Call parent to create revision with small content
      const result = await onSubmit(smallContent, largeContent);

      if (!result) {
        return; // Error occurred in parent
      }

      // Handle large content upload with progress tracking
      if (largeContent.length > 0) {
        const metrics = calculateUploadMetrics(largeContent);
        console.log(
          `Will upload ${largeContent.length} large files in ${metrics.totalChunks} chunks (${(metrics.totalSize / 1024 / 1024).toFixed(2)}MB total)`,
        );

        // Large content starts after small content
        const startingContentIndex = smallContent.length;

        // Create file mapping for chunked uploads to track individual file progress
        const largeFiles = value.uploaded_files.filter(
          (file) => file.size > MAX_DIRECT_UPLOAD_SIZE,
        );
        const fileMapping = largeFiles.map((file) => ({
          fileName: file.name,
          fileSize: file.size,
        }));

        await uploadProgress.uploadWithProgress({
          revisionId: result.revisionId,
          contents: largeContent,
          startingContentIndex,
          fileMapping,
        });
      }

      // Call completion callback to navigate
      await onSubmitComplete();
    },
  });

  const handleFilesAccepted = useCallback(
    (acceptedFiles: Array<FileWithPath>) => {
      form.setFieldValue('uploaded_files', (prev) => [
        ...prev,
        ...acceptedFiles,
      ]);
    },
    [form],
  );

  const removeFile = useCallback(
    (fileToRemove: File) => {
      form.setFieldValue('uploaded_files', (prev) =>
        prev.filter((file) => file !== fileToRemove),
      );
    },
    [form],
  );

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="markdown_content"
        validators={{
          onSubmit: createZodFieldValidator(
            contentFormSchema,
            'markdown_content',
          ),
        }}
      >
        {(field) => (
          <FormItem>
            <FormLabel field={field}>{contentLabel}</FormLabel>
            <FormControl field={field}>
              <div className="rounded-lg border border-input relative">
                <MDXEditor
                  className="rounded-md bg-background p-2 text-sm !static placeholder:text-muted-foreground focus:border-2 focus:border-accent-foreground focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  contentEditableClassName="prose"
                  markdown={field.state.value || ''}
                  onChange={(value) => field.handleChange(value)}
                  plugins={[
                    headingsPlugin(),
                    toolbarPlugin({
                      toolbarContents: () => (
                        <DiffSourceToggleWrapper>
                          <UndoRedo />
                          <BoldItalicUnderlineToggles />
                          <BlockTypeSelect />
                          <ListsToggle />
                        </DiffSourceToggleWrapper>
                      ),
                    }),
                    diffSourcePlugin(),
                  ]}
                />
              </div>
            </FormControl>
            <FormDescription>{contentDescription}</FormDescription>
            <FormMessage field={field} />
          </FormItem>
        )}
      </form.Field>

      <form.Field name="uploaded_files">
        {(field) => (
          <FormItem>
            <FormLabel field={field}>File Uploads</FormLabel>
            <FormControl field={field}>
              <div className="space-y-4">
                <Dropzone.Root
                  onDrop={handleFilesAccepted}
                  accept={{
                    'image/*': ['.jpg', '.png'],
                    'application/txt': ['.txt'],
                    'application/pdf': ['.pdf'],
                    'application/docx': ['.docx'],
                  }}
                  multiple
                >
                  <Dropzone.Zone className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                    <Dropzone.Input />
                    <div className="flex flex-col items-center gap-2">
                      <Icon
                        name="cloud-computing"
                        size="lg"
                        className="text-muted-foreground"
                      />
                      <div className="text-sm text-muted-foreground">
                        <Dropzone.DragDefault>
                          Drag files here or click to select
                        </Dropzone.DragDefault>
                        <Dropzone.DragAccepted>
                          Drop files here
                        </Dropzone.DragAccepted>
                        <Dropzone.DragRejected>
                          Some files were rejected
                        </Dropzone.DragRejected>
                      </div>
                    </div>
                  </Dropzone.Zone>

                  <Dropzone.Accepted>
                    {(_files) => (
                      <div className="grid gap-2 w-full min-w-0">
                        {field.state.value.map((file) => {
                          const isLargeFile =
                            file.size > MAX_DIRECT_UPLOAD_SIZE;
                          const fileKey = `${file.name}-${file.size}`;
                          const fileProgress =
                            uploadProgress.fileProgress.get(fileKey);

                          return (
                            <div
                              key={file.name + file.size}
                              className="p-3 bg-muted rounded-lg space-y-2 w-full min-w-0"
                            >
                              <div className="flex items-center justify-between w-full min-w-0">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <Icon
                                    name="file-outline"
                                    size="sm"
                                    className="flex-shrink-0"
                                  />
                                  <span
                                    className="text-sm truncate w-full"
                                    title={file.name}
                                  >
                                    {file.name}
                                  </span>
                                  {isLargeFile && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs flex-shrink-0"
                                    >
                                      Slow upload
                                    </Badge>
                                  )}
                                  <Badge
                                    variant="secondary"
                                    className="text-xs flex-shrink-0"
                                  >
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </Badge>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="flex-shrink-0 pr-0"
                                  onClick={() => removeFile(file)}
                                >
                                  <Icon name="x-outline" size="sm" />
                                  <span className="sr-only">
                                    Remove attachment
                                  </span>
                                </Button>
                              </div>

                              {/* Individual file progress bar for all files */}
                              <div className="space-y-1">
                                {fileProgress ? (
                                  <>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span>
                                        {fileProgress.status === 'waiting' &&
                                          'Ready for upload'}
                                        {fileProgress.status === 'uploading' &&
                                          (isLargeFile
                                            ? 'Uploading chunks...'
                                            : 'Uploading...')}
                                        {fileProgress.status === 'completed' &&
                                          'Upload complete'}
                                        {fileProgress.status === 'error' &&
                                          'Upload failed'}
                                      </span>
                                      <span>
                                        {fileProgress.percentComplete}%
                                      </span>
                                    </div>
                                    <Progress
                                      value={fileProgress.percentComplete}
                                      size="sm"
                                      variant="secondary"
                                    />
                                    {isLargeFile &&
                                      fileProgress.status === 'uploading' && (
                                        <div className="text-xs text-muted-foreground">
                                          Chunk {fileProgress.currentChunk} of{' '}
                                          {fileProgress.totalChunks}
                                        </div>
                                      )}
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span>Preparing...</span>
                                      <span>0%</span>
                                    </div>
                                    <Progress
                                      value={0}
                                      size="sm"
                                      variant="secondary"
                                    />
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Dropzone.Accepted>

                  <Dropzone.Rejected>
                    {(rejectedFiles) => (
                      <div className="text-sm text-destructive">
                        {rejectedFiles.map((rejection) => (
                          <div key={rejection.file.name + rejection.file.size}>
                            {rejection.file.name}:{' '}
                            {rejection.errors.map((e) => e.message).join(', ')}
                          </div>
                        ))}
                      </div>
                    )}
                  </Dropzone.Rejected>
                </Dropzone.Root>
              </div>
            </FormControl>
            <FormDescription>{uploadDescription}</FormDescription>
            <FormMessage field={field} />
          </FormItem>
        )}
      </form.Field>

      {(uploadProgress.isUploading || uploadProgress.percentComplete > 0) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Upload Progress</span>
            <span className="text-muted-foreground">
              {uploadProgress.percentComplete}%
            </span>
          </div>
          <Progress value={uploadProgress.percentComplete} size="sm" />
          {uploadProgress.progress && (
            <div className="text-xs text-muted-foreground">
              Uploading chunk {uploadProgress.progress.chunkId + 1} of{' '}
              {uploadProgress.progress.totalChunks} (
              {(uploadProgress.progress.uploadedBytes / 1024 / 1024).toFixed(1)}
              MB of{' '}
              {(uploadProgress.progress.totalContentSize / 1024 / 1024).toFixed(
                1,
              )}
              MB)
            </div>
          )}
          {uploadProgress.error && (
            <div className="text-xs text-destructive">
              Error: {uploadProgress.error}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end">
        {isSubmitting || uploadProgress.isUploading ? (
          <Button disabled={true}>
            <Loading
              text={uploadProgress.isUploading ? 'Uploading...' : 'Saving...'}
            />
          </Button>
        ) : (
          <Button type="submit">{submitButtonText}</Button>
        )}
      </div>
    </form>
  );
};
