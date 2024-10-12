// Consumed by vite.config.ts

import { index, layout, route, rootRoute } from '@tanstack/virtual-file-routes';

export const routes = rootRoute('root.tsx', [
  index('public/home.tsx'),
  route('/authenticate', 'public/authenticate.tsx'),
  layout('authenticated', '_layouts/_authenticated.tsx', [
    route('/nns', 'app/nns/nns.tsx'),

    route('/users', 'app/users/users.index.tsx', [
      index('app/users/users.all.tsx'),
      route('/create', 'app/users/users.create.tsx'),
      route('/$userId', 'app/users/$userId.tsx'),
    ]),

    route('/organisations', 'app/organisations/organisations.index.tsx', [
      index('app/organisations/organisations.tsx'),
      route('/create', 'app/organisations/organisations.create.tsx'),
      route('/$organisationId', 'app/organisations/$organisationId.index.tsx', [
        index('app/organisations/$organisationId.tsx'),
      ]),
    ]),

    route('/projects', 'app/projects/projects.index.tsx', [
      index('app/projects/projects.all.tsx'),
      route('/create', 'app/projects/projects.create.tsx'),
      route('/$projectId', 'app/projects/$projectId.index.tsx', [
        index('app/projects/$projectId.tsx'),
        route('/documents', 'app/documents/documents.index.tsx', [
          index('app/documents/documents.tsx'),
          route('/create', 'app/documents/documents.create.tsx'),
          route('/$documentId', 'app/documents/$documentId.index.tsx', [
            index('app/documents/$documentId.tsx'),
            route('/revisions', 'app/revisions/revisions.index.tsx', [
              route('/$revisionId', 'app/revisions/$revisionId.tsx'),
              route('/create', 'app/revisions/revisions.create.tsx'),
              route('/diff', 'app/revisions/revisions.diff.tsx'),
            ]),
          ]),
        ]),
      ]),
    ]),

    route('/documents', 'app/documents/documents.all.tsx'),

    route('/workflows', 'app/workflows/workflows.index.tsx', [
      index('app/workflows/workflows.all.tsx'),
      route('/create', 'app/workflows/workflows.create.tsx'),
      route('/$workflowId', 'app/workflows/$workflowId.index.tsx', [
        index('app/workflows/$workflowId.tsx'),
      ]),
    ]),
  ]),
]);
