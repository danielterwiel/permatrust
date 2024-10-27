import { createRouter } from "@tanstack/react-router";

import { auth } from "@/context/auth";
import { api } from "@/context/api";
import { routeTree } from "./routeTree.gen";

export const router = createRouter({
  routeTree,

  defaultPreload: "intent",
  defaultStaleTime: 5000,
  context: {
    auth,
    api,
    active: {},
  },
});
