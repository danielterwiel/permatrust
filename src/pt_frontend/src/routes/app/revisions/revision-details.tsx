import { MDXEditor, headingsPlugin } from '@mdxeditor/editor';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { getRevisionOptions, listRevisionContentsOptions } from '@/api/queries/revisions';
import { revisionIdSchema } from '@/schemas/entities';
import { downloadChunkedContent, triggerDownload } from '@/utils/chunked-revision-download';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';

import type { RevisionContent } from '@/declarations/tenant_canister/tenant_canister.did';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId/revisions/$revisionId',
)({
  beforeLoad: () => ({
    getTitle: () => 'Revision',
  }),
  loader: async ({ context, params: { revisionId } }) => {
    const revisionIdParsed = revisionIdSchema.parse(revisionId);
    const revision = await context.query.ensureQueryData(
      getRevisionOptions(revisionIdParsed),
    );

    // Fetch the actual content for this revision
    const revisionContents = await context.query.ensureQueryData(
      listRevisionContentsOptions(revisionIdParsed),
    );

    return {
      revision,
      revisionContents,
    };
  },
  component: RevisionDetails,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function ChunkedMarkdownDisplay({ content }: { content: RevisionContent }) {
  const [isLoading, setIsLoading] = useState(false);
  const [markdownText, setMarkdownText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadMarkdown = async () => {
    if (content.content_data.length === 0) return;
    
    const contentData = content.content_data[0];
    if (!('Chunked' in contentData)) return;

    setIsLoading(true);
    setError(null);

    try {
      const { total_chunks, total_size } = contentData.Chunked;

      const assembledData = await downloadChunkedContent({
        contentId: content.id,
        totalChunks: total_chunks,
        totalSize: Number(total_size),
      });

      const text = new TextDecoder().decode(assembledData);
      setMarkdownText(text);
    } catch (err) {
      setError(`Failed to load markdown: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
        <Button onClick={loadMarkdown} size="sm" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (!markdownText) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>Chunked markdown content</p>
        <Button onClick={loadMarkdown} size="sm" className="mt-2">
          Load Content
        </Button>
      </div>
    );
  }

  return (
    <MDXEditor
      contentEditableClassName="prose"
      markdown={markdownText}
      onError={() => setError('Failed to render markdown')}
      plugins={[headingsPlugin()]}
      readOnly={true}
    />
  );
}

function RevisionDetails() {
  const { revision, revisionContents } = Route.useLoaderData();
  const [downloadProgress, setDownloadProgress] = useState<{[contentId: string]: number}>({});
  const [isDownloading, setIsDownloading] = useState<{[contentId: string]: boolean}>({});

  const getFileName = (content: RevisionContent, index: number): string => {
    if (content.file_name.length > 0) {
      return content.file_name[0]!; // Safe because we checked length > 0
    }
    if ('Upload' in content.content_type) {
      return `upload-${index + 1}`;
    }
    return `content-${index + 1}`;
  };

  const handleDownload = async (content: RevisionContent, index: number) => {
    const fileName = getFileName(content, index);
    const contentIdStr = content.id.toString();

    if (content.content_data.length === 0) {
      // Reference to existing content, cannot download
      alert('This content is a reference to existing content and cannot be downloaded directly.');
      return;
    }

    const contentData = content.content_data[0];
    if ('Direct' in contentData) {
      // Download directly from embedded bytes
      const bytes = new Uint8Array(contentData.Direct.bytes);
      triggerDownload(bytes, fileName);
    } else {
      // Chunked download
      const { total_chunks, total_size } = contentData.Chunked;

      try {
        setIsDownloading(prev => ({ ...prev, [contentIdStr]: true }));
        setDownloadProgress(prev => ({ ...prev, [contentIdStr]: 0 }));

        const assembledData = await downloadChunkedContent({
          contentId: content.id,
          totalChunks: total_chunks,
          totalSize: Number(total_size),
          onProgress: (progress) => {
            setDownloadProgress(prev => ({
              ...prev,
              [contentIdStr]: progress.percentComplete
            }));
          },
        });

        triggerDownload(assembledData, fileName);
      } catch (error) {
        console.error('Download failed:', error);
        alert(`Download failed: ${error}`);
      } finally {
        setIsDownloading(prev => ({ ...prev, [contentIdStr]: false }));
        setDownloadProgress(prev => ({ ...prev, [contentIdStr]: 0 }));
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="file-stack-outline"
              size="lg"
            />
            Revision #{revision.version}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {revisionContents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Icon name="file-outline" size="lg" className="mx-auto mb-2" />
              <p>No content available for this revision</p>
            </div>
          ) : (
            revisionContents.map((content, index) => {
              const fileName = getFileName(content, index);

              if ('Markdown' in content.content_type) {
                return (
                  <div key={content.id}>
                    <div className="flex items-center gap-2 mb-4 w-full min-w-0">
                      <Icon name="file-orientation-outline" size="sm" className="flex-shrink-0" />
                      <Badge variant="secondary" className="flex-shrink-0">Markdown</Badge>
                      {fileName && (
                        <span className="text-sm text-muted-foreground truncate" title={fileName}>{fileName}</span>
                      )}
                    </div>
                    {content.content_data.length === 0 ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-4 text-muted-foreground">
                            <p>This content is a reference to existing content.</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : 'Direct' in content.content_data[0] ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <MDXEditor
                            contentEditableClassName="prose"
                            markdown={new TextDecoder().decode(new Uint8Array(content.content_data[0].Direct.bytes))}
                            onError={(_error) => {
                              // TODO: handle error
                            }}
                            plugins={[headingsPlugin()]}
                            readOnly={true}
                          />
                        </CardContent>
                      </Card>
                    ) : (
                      <ChunkedMarkdownDisplay content={content} />
                    )}
                  </div>
                );
              }

              if ('Upload' in content.content_type) {
                return (
                  <div key={content.id} className="border rounded-lg p-4 w-full min-w-0">
                    <div className="flex items-center justify-between w-full min-w-0">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Icon name="file-outline" size="sm" className="flex-shrink-0" />
                        <Badge variant="outline" className="flex-shrink-0">Upload</Badge>
                        <span className="text-sm font-medium truncate w-full" title={fileName}>{fileName}</span>
                        <span className="text-sm text-muted-foreground flex-shrink-0">
                          {content.content_data.length === 0
                            ? 'Reference'
                            : 'Direct' in content.content_data[0]
                              ? formatFileSize(content.content_data[0].Direct.bytes.length)
                              : formatFileSize(Number(content.content_data[0].Chunked.total_size))
                          }
                        </span>
                      </div>
                      {content.content_data.length === 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 ml-4"
                          disabled
                        >
                          <Icon name="cloud-computing" size="sm" className="mr-2" />
                          Reference
                        </Button>
                      ) : isDownloading[content.id.toString()] ? (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${downloadProgress[content.id.toString()] || 0}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {downloadProgress[content.id.toString()] || 0}%
                          </span>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-shrink-0 ml-4"
                          onClick={() => handleDownload(content, index)}
                        >
                          <Icon name="cloud-computing" size="sm" className="mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
