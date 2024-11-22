import type { routeTree } from '@/routeTree.gen';
import type { ParseRoute } from '@tanstack/react-router';

export type ValidRoute = ParseRoute<typeof routeTree>['parentRoute'];
