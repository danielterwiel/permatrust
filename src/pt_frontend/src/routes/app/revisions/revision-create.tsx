import { createFileRoute } from '@tanstack/react-router';

import { tenantMutations as mutations } from '@/api/mutations';
import { listRevisionsByDocumentIdOptions } from '@/api/queries';
import { documentIdSchema, projectIdSchema } from '@/schemas/entities';

import { CreateRevisionForm } from '@/components/create-revision-form';
import type { createRevisionFormSchema } from '@/components/create-revision-form';

import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId/revisions/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create revision',
  }),
  loader: async ({ context, params }) => {
    const documentId = documentIdSchema.parse(params.documentId);

    const revisions = await context.query.ensureQueryData(
      listRevisionsByDocumentIdOptions(documentId),
    );
    return { revisions };
  },
  component: RevisionsCreate,
});

function RevisionsCreate() {
  const { isPending: isSubmitting, mutate: createRevision } =
    mutations.useCreateRevision();
  const params = Route.useParams();
  const navigate = Route.useNavigate();
  const { revisions: revisionData } = Route.useLoaderData();

  const revision = revisionData[0][0];

  function onSubmit(values: z.infer<typeof createRevisionFormSchema>) {
    try {
      const encoder = new TextEncoder();
      const content = encoder.encode(values.content);

      const projectId = projectIdSchema.parse(params.projectId);
      const documentId = documentIdSchema.parse(params.documentId);

      createRevision(
        {
          content,
          document_id: documentId,
          project_id: projectId,
        },
        {
          onSuccess: () => {
            navigate({
              params: {
                documentId: params.documentId,
                projectId: params.projectId,
              },
              to: '/projects/$projectId/documents/$documentId',
            });
          },
        },
      );
    } catch (_error) {
      // TODO: handle error
    }
  }

  return (
    <CreateRevisionForm
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      projectId={params.projectId}
      revision={revision}
    />
  );
}
