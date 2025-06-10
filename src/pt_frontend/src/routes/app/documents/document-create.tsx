import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';
import { projectIdSchema } from '@/schemas/entities';
import { tryCatch } from '@/utils/try-catch';

import { CreateDocumentForm } from '@/components/create-document-form';

import type { RevisionContent } from '@/declarations/tenant_canister/tenant_canister.did';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create document',
  }),
  component: CreateDocument,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function CreateDocument() {
  const { isPending: isDocumentSubmitting, mutate: createDocument } =
    mutations.tenant.useCreateDocument();
  const { isPending: isRevisionSubmitting, mutate: createRevision } =
    mutations.tenant.useCreateRevision();
  const navigate = useNavigate();
  const params = Route.useParams();

  let createdDocumentId: bigint | null = null;

  const isSubmitting = isDocumentSubmitting || isRevisionSubmitting;

  async function onSubmit(
    title: string,
    smallContents: Array<RevisionContent>,
    largeContents: Array<RevisionContent>,
  ): Promise<{ revisionId: bigint } | null> {
    const projectId = projectIdSchema.parse(params.projectId);

    // Step 1: Create the document
    const documentResult = await tryCatch(
      createDocument({
        project_id: projectId,
        title,
      }),
    );

    if (documentResult.error) {
      console.error('Error creating document:', documentResult.error);
      return null;
    }

    createdDocumentId = documentResult.data;

    // Step 2: Create revision with small content
    const revisionResult = await tryCatch(
      createRevision({
        project_id: projectId,
        document_id: createdDocumentId,
        contents: smallContents,
      }),
    );

    if (revisionResult.error) {
      console.error('Error creating revision:', revisionResult.error);
      return null;
    }

    // Return the revision ID for large content uploads (if needed)
    return { revisionId: revisionResult.data };
  }

  function onSubmitComplete() {
    // Navigate to the created document
    if (createdDocumentId) {
      navigate({
        params: {
          documentId: createdDocumentId.toString(),
          projectId: params.projectId,
        },
        to: '/projects/$projectId/documents/$documentId',
      });
    } else {
      // Fallback to documents list if no document ID
      navigate({
        params: {
          projectId: params.projectId,
        },
        to: '/projects/$projectId/documents',
      });
    }
  }

  return (
    <CreateDocumentForm
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onSubmitComplete={onSubmitComplete}
      projectId={params.projectId}
    />
  );
}
