import {
  createFileRoute,
  useRouter,
  Link,
  Outlet,
} from "@tanstack/react-router";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute(
  "/_auth/_layout/projects/_projects/projects",
)({
  component: ProjectLayout,
});

const TABS = [["/projects/projects", "Project"]] as const;

function ProjectLayout() {
  const router = useRouter();
  return (
    <Tabs defaultValue={router.history.location.href}>
      <TabsList>
        {TABS.map(([to, label]) => (
          <TabsTrigger value={to} key={to} asChild>
            <Link to={to}>{label}</Link>
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={router.history.location.href}>
        <Outlet />
      </TabsContent>
    </Tabs>
  );
}
