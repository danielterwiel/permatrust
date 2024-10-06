// Consumed by vite.config.ts

import { index, layout, route, rootRoute } from '@tanstack/virtual-file-routes';

export const routes = rootRoute('root.tsx', [
  index('public/home.tsx'),
  route('/authenticate', 'public/authenticate.tsx'),
  layout('authenticated', '_layouts/_authenticated.tsx', [
    route('/nns', 'app/nns/nns.tsx'),
    // route('/users', 'app/users/users.tsx'),
    route('/organisations', 'app/organisations/organisations.index.tsx', [
      index('app/organisations/organisations.tsx'),
      route('/create', 'app/organisations/create.tsx'),
      route('/$organisationId', 'app/organisations/$organisationId.index.tsx', [
        route('/projects', 'app/projects/projects.index.tsx', [
          index('app/projects/projects.tsx'),
          route('/create', 'app/projects/create.tsx'),
          route('/$projectId', 'app/projects/$projectId.index.tsx', [
            index('app/projects/$projectId.tsx'),
            route('/documents', 'app/documents/documents.index.tsx', [
              route('/create', 'app/documents/create.tsx'),
              route('/$documentId', 'app/documents/$documentId.index.tsx', [
                index('app/documents/$documentId.tsx'),
                route('/revisions', 'app/revisions/revisions.index.tsx', [
                  route('/$revisionId', 'app/revisions/$revisionId.tsx'),
                  route('/create', 'app/revisions/create.tsx'),
                  route('/diff', 'app/revisions/diff.tsx'),
                ]),
              ]),
            ]),
          ]),
        ]),
      ]),
    ]),
  ]),
]);
