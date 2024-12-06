import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { api } from '@/api';

import {
  CreateRevisionForm,
  type createRevisionFormSchema,
} from '@/components/create-revision-form';

import { buildFilterField } from '@/utils/buildFilterField';
import { isAppError } from '@/utils/isAppError';

import { ENTITY_NAME } from '@/consts/entities';
import { FILTER_FIELD, SORT_ORDER } from '@/consts/pagination';

import type {
  PaginationInput,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { z } from 'zod';
import { toBigIntSchema, toNumberSchema } from '@/schemas/primitives';

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
  filters: [],
  page_number: 1,
  page_size: 1,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId/revisions/create',
)({
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
  component: RevisionsCreate,
});

function RevisionsCreate() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { documentId, projectId } = Route.useParams();
  const { revision } = Route.useRouteContext({
    select: ({ revision }) => ({ revision }),
  });
  const navigate = Route.useNavigate();

  async function onSubmit(values: z.infer<typeof createRevisionFormSchema>) {
    try {
      setIsSubmitting(true);
      const encoder = new TextEncoder();
      const content = encoder.encode(values.content);

      const projectIdNumber = toNumberSchema.parse(projectId);
      const documentIdBigInt = toBigIntSchema.parse(documentId);

      await api.create_revision(projectIdNumber, documentIdBigInt, content);

      navigate({
        to: '/projects/$projectId/documents/$documentId',
      });
    } catch (_error) {
      // TODO: handle error
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CreateRevisionForm
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      projectId={projectId}
      revision={revision}
    />
  );
}
