import { createRouter } from '@tanstack/react-router';

import { auth } from '@/context/auth';
import { routeTree } from './routeTree.gen';

export const router = createRouter({
  routeTree,

  defaultPreload: 'intent',
  defaultStaleTime: 5000,
  context: {
    auth,
    active: {},
  },
});
