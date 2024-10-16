import type { AuthContext } from '@/context/auth';
import type { ApiContext } from '@/context/api';
import type {
  Project,
  Document,
  Revision,
} from '@/declarations/pt_backend/pt_backend.did';

import type { routeTree } from '@/routeTree.gen';
import type { ParseRoute } from '@tanstack/react-router';

export type ValidRoute = ParseRoute<typeof routeTree>['parentRoute'];

export type RouteContext = {
  auth: AuthContext;
  api: ApiContext;

  active: {
    project?: Project;
    document?: Document;
    revision?: Revision;
  };

  getTitle?: () => string;
};
