import { index, layout, rootRoute, route } from '@tanstack/virtual-file-routes';

export const routes = rootRoute('root.tsx', [
  index('public/home.tsx'),
  layout('initialized', '_layouts/_initialized.tsx', [
    route('/login', 'public/login.tsx'),
    route('/unauthorized', 'public/unauthorized.tsx'),

    layout('authenticated', '_layouts/_authenticated.tsx', [
      layout('onboarding', '_layouts/_onboarding.tsx', [
        route('/onboarding', [
          index('app/onboarding/onboarding-index.tsx'),
          route('/user/create', 'app/onboarding/user-create.tsx'),
          route(
            '/organization/create',
            'app/onboarding/organization-create.tsx',
          ),
        ]),
      ]),

      layout('onboarded', '_layouts/_onboarded.tsx', [
        route('/users', 'app/users/users-index.tsx', [
          index('app/users/users-list.tsx'),
          route('/$userId', 'app/users/user-details.tsx'),
          route('/create', 'app/users/user-create.tsx'),
        ]),

        route('/organizations', 'app/organizations/organizations-index.tsx', [
          index('app/organizations/organizations-list.tsx'),
          route('/create', 'app/organizations/organization-create.tsx'),
          route(
            '/$organizationId',
            'app/organizations/organization-index.tsx',
            [index('app/organizations/organization-details.tsx')],
          ),
        ]),

        route('/projects', 'app/projects/projects-index.tsx', [
          index('app/projects/projects-list.tsx'),
          route('/create', 'app/projects/project-create.tsx'),
          route('/$projectId', 'app/projects/project-index.tsx', [
            index('app/projects/project-details.tsx'),
            route('/documents', 'app/documents/documents-index.tsx', [
              index('app/documents/project-documents-list.tsx'),
              route('/create', 'app/documents/document-create.tsx'),
              route('/$documentId', 'app/documents/document-index.tsx', [
                index('app/documents/document-details.tsx'),
                route('/revisions', 'app/revisions/revisions-index.tsx', [
                  route('/$revisionId', 'app/revisions/revision-details.tsx'),
                  route('/create', 'app/revisions/revision-create.tsx'),
                  route('/diff', 'app/revisions/revisions-diff.tsx'),
                ]),
              ]),
            ]),
          ]),
        ]),

        route('/documents', 'app/documents/documents-list.tsx'),

        route('/workflows', 'app/workflows/workflows-index.tsx', [
          index('app/workflows/workflows-list.tsx'),
          route('/create', 'app/workflows/workflow-create.tsx'),
          route('/$workflowId', 'app/workflows/workflow-index.tsx', [
            index('app/workflows/workflow-details.tsx'),
          ]),
        ]),
      ]),
    ]),
  ]),
]);
