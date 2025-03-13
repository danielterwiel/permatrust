import { createFileRoute } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';
import { getRevisionsByDocumentIdOptions } from '@/api/queries';
import { CreateRevisionForm } from '@/components/create-revision-form';
import { ENTITY } from '@/consts/entities';
import {
  FILTER_OPERATOR,
  FILTER_SORT_FIELDS,
  SORT_ORDER,
} from '@/consts/pagination';
import { documentIdSchema, projectIdSchema } from '@/schemas/entities';
import { createEntityPaginationSchema } from '@/schemas/pagination';
import { processPaginationInput } from '@/utils/pagination';

import type { createRevisionFormSchema } from '@/components/create-revision-form';
import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';
import type { z } from 'zod';

const { defaultPagination: revisionPagination } = createEntityPaginationSchema(
  ENTITY.REVISION,
  {
    defaultFilterField: FILTER_SORT_FIELDS.REVISION.CREATED_AT,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: '',
    defaultSortField: FILTER_SORT_FIELDS.REVISION.CREATED_AT,
    defaultSortOrder: SORT_ORDER.DESC,
  },
);

const LAST_REVISION_PAGINATION: PaginationInput = {
  ...revisionPagination,
  page_size: 1,
};

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId/revisions/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create revision',
  }),
  loader: async ({ context, params }) => {
    const paginationInput = processPaginationInput(LAST_REVISION_PAGINATION);
    const documentId = documentIdSchema.parse(params.documentId);

    const revisions = await context.query.ensureQueryData(
      getRevisionsByDocumentIdOptions(documentId, paginationInput),
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
