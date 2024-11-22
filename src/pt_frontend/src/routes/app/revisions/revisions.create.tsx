import { api } from '@/api';
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { buildFilterField } from '@/utils/buildFilterField';
import { isAppError } from '@/utils/isAppError';
import {
  CreateRevisionForm,
  type createRevisionFormSchema,
} from '@/components/create-revision-form';
import { SORT_ORDER, FILTER_FIELD } from '@/consts/pagination';
import { ENTITY_NAME } from '@/consts/entities';
import type {
  PaginationInput,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { z } from 'zod';

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(
      ENTITY_NAME.Revision,
      FILTER_FIELD.Revision.CreatedAt,
    ),
    order: SORT_ORDER.Desc,
  },
];

const LAST_REVISION_PAGINATION: PaginationInput = {
  page_size: 1,
  page_number: 1,
  filters: [],
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId/revisions/create',
)({
  component: RevisionsCreate,
  beforeLoad: async ({ params }) => {
    const response = await api.list_revisions_by_document_id(
      BigInt(params.documentId),
      LAST_REVISION_PAGINATION,
    );
    if (isAppError(response)) {
      throw new Error('Error fetching Revision');
    }
    const [[revision]] = response;

    return {
      getTitle: () => 'Create revision',
      revision,
    };
  },
});

function RevisionsCreate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { projectId, documentId } = Route.useParams();
  const { revision } = Route.useRouteContext({
    select: ({ revision }) => ({ revision }),
  });
  const navigate = Route.useNavigate();

  async function onSubmit(values: z.infer<typeof createRevisionFormSchema>) {
    try {
      setIsSubmitting(true);
      const encoder = new TextEncoder();
      const content = encoder.encode(values.content);

      await api.create_revision(BigInt(projectId), BigInt(documentId), content);

      navigate({
        to: '/projects/$projectId/documents/$documentId',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CreateRevisionForm
      projectId={projectId}
      revision={revision}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    />
  );
}
