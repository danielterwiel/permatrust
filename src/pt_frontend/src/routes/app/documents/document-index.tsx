import { Outlet, createFileRoute } from '@tanstack/react-router';

import { getDocumentOptions } from '@/api/queries';
import { documentIdSchema } from '@/schemas/entities';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId',
)({
  loader: async ({ context, params }) => {
    const documentId = documentIdSchema.parse(params.documentId);
    const document = await context.query.ensureQueryData(
      getDocumentOptions(documentId),
    );
    context.getTitle = () => document.title;
  },
  component: DocumentId,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function DocumentId() {
  return <Outlet />;
}
