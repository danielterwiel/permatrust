import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { tenantMutations as mutations } from '@/api/mutations';
import { projectIdSchema } from '@/schemas/entities';

import { CreateDocumentForm } from '@/components/create-document-form';
import type { createDocumentFormSchema } from '@/components/create-document-form';

import type { z } from 'zod';

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
  const { isPending: isSubmitting, mutate: createDocument } =
    mutations.useCreateDocument();
  const navigate = useNavigate();
  const params = Route.useParams();

  function onSubmit(values: z.infer<typeof createDocumentFormSchema>) {
    const encoder = new TextEncoder();
    const content = encoder.encode(values.content);

    const projectId = projectIdSchema.parse(params.projectId);

    createDocument(
      {
        content,
        project_id: projectId,
        title: values.title,
      },
      {
        onSuccess: (documentId) => {
          navigate({
            params: {
              documentId: documentId.toString(),
              projectId: params.projectId,
            },
            to: '/projects/$projectId/documents/$documentId',
          });
        },
      },
    );
  }

  return (
    <CreateDocumentForm
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      projectId={params.projectId}
    />
  );
}
