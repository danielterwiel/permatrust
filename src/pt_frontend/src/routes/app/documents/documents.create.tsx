import { api } from '@/api';
import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  CreateDocumentForm,
  type createDocumentFormSchema,
} from '@/components/create-document-form';
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

export function CreateDocument() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const params = Route.useParams();

  async function onSubmit(values: z.infer<typeof createDocumentFormSchema>) {
    setIsSubmitting(true);
    const encoder = new TextEncoder();
    const content = encoder.encode(values.content);
    const documentId = await api.create_document(
      BigInt(params.projectId),
      values.title,
      content,
    );

    setIsSubmitting(false);
    navigate({
      to: '/projects/$projectId/documents/$documentId',
      params: {
        projectId: params.projectId,
        documentId: documentId.toString(),
      },
    });
  }

  return (
    <CreateDocumentForm
      projectId={params.projectId}
      onSubmit={onSubmit}
      isSubmitting={isSubmitting}
    />
  );
}
