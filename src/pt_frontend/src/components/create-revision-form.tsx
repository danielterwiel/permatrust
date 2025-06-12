import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { downloadChunkedContent } from '@/utils/chunked-revision-download';

import { ContentForm } from '@/components/content-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import type { RevisionContent } from '@/declarations/tenant_canister/tenant_canister.did';

type CreateRevisionFormProps = {
  isSubmitting: boolean;
  onSubmit: (
    contents: Array<RevisionContent>,
    largeContents: Array<RevisionContent>,
  ) => Promise<{ revisionId: bigint } | null>;
  onSubmitComplete: () => void;
  revisionContents: Array<RevisionContent> | undefined;
};

export const CreateRevisionForm: FC<CreateRevisionFormProps> = ({
  isSubmitting,
  onSubmit,
  onSubmitComplete,
  revisionContents,
}) => {
  const [isLoadingRevisionData, setIsLoadingRevisionData] = useState(false);
  const [defaultMarkdownContent, setDefaultMarkdownContent] =
    useState('# Hello world');
  const [defaultFiles, setDefaultFiles] = useState<Array<File>>([]);

  // Helper function to convert RevisionContent back to File for form display
  const convertContentToFile = async (
    content: RevisionContent,
  ): Promise<File | null> => {
    try {
      // Check if content_data is available (not a reference)
      if (content.content_data.length === 0) {
        console.warn(
          `Content ${content.id} is a reference with no data, cannot convert to file`,
        );
        return null;
      }

      const contentData = content.content_data[0];
      let bytes: Uint8Array;

      if ('Direct' in contentData) {
        bytes = new Uint8Array(contentData.Direct.bytes);
      } else {
        // Download chunked content
        const { total_chunks, total_size } = contentData.Chunked;
        bytes = await downloadChunkedContent({
          contentId: content.id,
          totalChunks: total_chunks,
          totalSize: Number(total_size),
        });
      }

      const fileName =
        content.file_name.length > 0
          ? content.file_name[0]
          : `content-${content.id}`;
      const mimeType =
        'Upload' in content.content_type
          ? 'application/octet-stream'
          : 'text/markdown'; // oxlint-disable-line

      const arrayBuffer = new ArrayBuffer(bytes.length);
      const view = new Uint8Array(arrayBuffer);
      view.set(bytes);

      return new File([arrayBuffer], fileName ?? 'unknown', { type: mimeType });
    } catch (error) {
      console.error('Failed to convert content to file:', error);
      return null;
    }
  };

  // Extract markdown content from revision contents
  const getMarkdownContent = async (): Promise<string> => {
    if (!revisionContents) return '';

    const markdownContent = revisionContents.find(
      (content) => 'Markdown' in content.content_type,
    );

    if (!markdownContent) return '';

    try {
      // Check if content_data is available (not a reference)
      if (markdownContent.content_data.length === 0) {
        console.warn(
          `Markdown content ${markdownContent.id} is a reference with no data, cannot load`,
        );
        return '';
      }

      const contentData = markdownContent.content_data[0];
      let bytes: Uint8Array;

      if ('Direct' in contentData) {
        bytes = new Uint8Array(contentData.Direct.bytes);
      } else {
        // Download chunked markdown content
        const { total_chunks, total_size } = contentData.Chunked;
        bytes = await downloadChunkedContent({
          contentId: markdownContent.id,
          totalChunks: total_chunks,
          totalSize: Number(total_size),
        });
      }

      return new TextDecoder().decode(bytes);
    } catch (error) {
      console.error('Failed to load markdown content:', error);
      return '';
    }
  };

  // Get upload files from revision contents
  const getUploadFiles = async (): Promise<Array<File>> => {
    if (!revisionContents) return [];

    const uploadContents = revisionContents.filter(
      (content) => 'Upload' in content.content_type,
    );

    const files: Array<File> = [];

    for (const content of uploadContents) {
      const file = await convertContentToFile(content);
      if (file) {
        files.push(file);
      }
    }

    return files;
  };

  // Load revision data and populate form when component mounts
  // biome-ignore lint/correctness/useExhaustiveDependencies: infinite loop
  useEffect(() => {
    const loadRevisionData = async () => {
      if (!revisionContents) {
        setIsLoadingRevisionData(false);
        return;
      }

      setIsLoadingRevisionData(true);

      try {
        const [markdownContent, uploadFiles] = await Promise.all([
          getMarkdownContent(),
          getUploadFiles(),
        ]);

        // Set default values for the ContentForm
        setDefaultMarkdownContent(markdownContent);
        setDefaultFiles(uploadFiles);
      } catch (error) {
        console.error('Failed to load revision data:', error);
      } finally {
        setIsLoadingRevisionData(false);
      }
    };

    loadRevisionData();
  }, [revisionContents]); // oxlint-disable-line

  if (isLoadingRevisionData) {
    return (
      <>
        <div className="flex items-center justify-between pb-4">
          <h2 className="text-lg font-semibold">
            Loading previous revision...
          </h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              <Icon
                className="text-muted-foreground pb-1 mr-2"
                name="file-stack-outline"
                size="lg"
              />
              Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-32 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-24 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold">
          {revisionContents
            ? 'Create new revision (based on latest)'
            : 'Create new revision'}
        </h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="file-stack-outline"
              size="lg"
            />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentForm
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
            onSubmitComplete={onSubmitComplete}
            defaultMarkdownContent={defaultMarkdownContent}
            defaultFiles={defaultFiles}
            originalRevisionContents={revisionContents}
            submitButtonText="Create revision"
            contentLabel="Markdown Content"
            contentDescription="Write your markdown content here."
            uploadDescription="Upload additional files to include with this revision."
          />
        </CardContent>
      </Card>
    </>
  );
};
