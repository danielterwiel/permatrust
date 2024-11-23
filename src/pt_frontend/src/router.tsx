import { createRouter } from '@tanstack/react-router';

import { rootContext } from './context/root';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  context: rootContext,

  defaultPreload: 'intent',
  defaultStaleTime: 5000,
  routeTree,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
