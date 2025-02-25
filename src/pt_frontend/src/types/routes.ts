import type { routeTree } from '@/routeTree.gen';
import type { Route } from '@tanstack/react-router';

export type ValidRoute = Route<typeof routeTree>['parentRoute'];
