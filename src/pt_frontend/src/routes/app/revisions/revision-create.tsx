import { createFileRoute } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';
import { listRevisionsByDocumentIdOptions } from '@/api/queries';
import { listRevisionContentsOptions } from '@/api/queries/revisions';
import { toast } from '@/hooks/use-toast';
import { documentIdSchema, projectIdSchema } from '@/schemas/entities';
import { tryCatch } from '@/utils/try-catch';

import { CreateRevisionForm } from '@/components/create-revision-form';

import type { RevisionContent } from '@/declarations/tenant_canister/tenant_canister.did';

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

    // Get the latest revision's contents to prefill the form
    let revisionContents: Array<RevisionContent> | undefined = undefined;
    if (revisions[0].length > 0) {
      const latestRevision = revisions[0][0]; // Most recent revision
      revisionContents = await context.query.ensureQueryData(
        listRevisionContentsOptions(latestRevision.id),
      );
    }

    return { revisions, revisionContents };
  },
  component: RevisionsCreate,
});

function RevisionsCreate() {
  const { isPending: isSubmitting, mutate: createRevision } =
    mutations.tenant.useCreateRevision();
  const params = Route.useParams();
  const navigate = Route.useNavigate();
  const { revisionContents } = Route.useLoaderData();

  async function onSubmit(contents: Array<RevisionContent>) {
    const projectId = projectIdSchema.parse(params.projectId);
    const documentId = documentIdSchema.parse(params.documentId);

    // Create revision with small content first
    const result = await tryCatch(
      createRevision({
        contents: contents,
        document_id: documentId,
        project_id: projectId,
      }),
    );

    if (result.error) {
      console.error('Error creating revision:', result.error);
      return null;
    }

    const revisionId = result.data;

    // Return revision ID so form can handle large content upload
    return { revisionId };
  }

  function onSubmitComplete() {
    // Show success toast after all uploads are complete
    toast({
      title: 'Revision created',
      description:
        'Your revision has been successfully created with all files uploaded.',
    });

    // Navigate after all uploads are complete
    navigate({
      params: {
        documentId: params.documentId,
        projectId: params.projectId,
      },
      to: '/projects/$projectId/documents/$documentId',
    });
  }

  return (
    <CreateRevisionForm
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onSubmitComplete={onSubmitComplete}
      revisionContents={revisionContents}
    />
  );
}
