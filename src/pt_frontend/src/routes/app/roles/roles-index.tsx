import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { ReactNode } from 'react';

const TabsLinkTrigger = ({
  children,
  href,
}: {
  children: ReactNode;
  href: 'assign' | 'create' | 'list';
}) => (
  <TabsTrigger asChild value={href}>
    <Link href={href}>{children}</Link>
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
  return (
    <Tabs defaultValue="list">
      <TabsList className="w-full justify-start">
        <TabsLinkTrigger href="list">Roles</TabsLinkTrigger>
        <TabsLinkTrigger href="assign">Assign</TabsLinkTrigger>
        <TabsLinkTrigger href="create">Create</TabsLinkTrigger>
      </TabsList>
      <TabsContent value="list">
        <Outlet />
      </TabsContent>
      <TabsContent value="assign">
        <Outlet />
      </TabsContent>
      <TabsContent value="create">
        <Outlet />
      </TabsContent>
    </Tabs>
  );
}
