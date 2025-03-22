import { Outlet, createFileRoute } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { projectIdSchema } from '@/schemas/entities';

import { Link } from '@/components/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { ProjectId } from '@/types/entities';

const TabsLinkTrigger = ({
  children,
  href,
  projectId,
}: {
  children: ReactNode;
  href: 'assign' | 'assigned' | 'create' | 'list';
  projectId: ProjectId;
}) => (
  <TabsTrigger asChild value={href}>
    <Link href={`/projects/${projectId}/roles/${href}`}>{children}</Link>
  </TabsTrigger>
);

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles',
)({
  beforeLoad: () => ({
    getTitle: () => 'Roles',
  }),
  component: Roles,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Roles() {
  const params = Route.useParams();
  const projectId = projectIdSchema.parse(params.projectId);

  return (
    <Tabs defaultValue="list">
      <TabsList className="w-full justify-start">
        <TabsLinkTrigger projectId={projectId} href="assigned">
          Assigned
        </TabsLinkTrigger>
        <TabsLinkTrigger projectId={projectId} href="assign">
          Assign
        </TabsLinkTrigger>
        <TabsLinkTrigger projectId={projectId} href="list">
          Roles
        </TabsLinkTrigger>
        <TabsLinkTrigger projectId={projectId} href="create">
          Create
        </TabsLinkTrigger>
      </TabsList>
      <Outlet />
    </Tabs>
  );
}
