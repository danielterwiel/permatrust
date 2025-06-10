import { Link } from '@tanstack/react-router';
import type { FC } from 'react';

import type { authActor as AuthActor } from '@/machines/auth';

import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const mainItems = [
  ['/organization', 'Organization', 'building-outline'],
  ['/projects', 'Projects', 'briefcase-outline'],
  ['/documents', 'Documents', 'files-outline'],
  ['/users', 'Users', 'users-outline'],
  ['/workflows', 'Workflows', 'file-orientation-outline'],
] as const;

const bottomItems = [
  ['/logs', 'Logs', 'logs'],
  ['/settings', 'Settings', 'settings'],
  ['/management', 'Management', 'cloud-computing'],
] as const;

type MenuItemsProps = { items: typeof mainItems | typeof bottomItems };

const MenuItems: FC<MenuItemsProps> = ({ items }) => (
  <SidebarMenu>
    {items.map((item) => {
      const [to, title, icon] = item;
      return (
        <SidebarMenuItem key={title}>
          <SidebarMenuButton asChild>
            <Link
              activeOptions={
                {
                  // If the route points to the root of it's parent,
                  // make sure it's only active if it's exact
                  // exact: to === '.',
                }
              }
              activeProps={{ className: 'font-bold' }}
              className="block py-2 px-3 text-nowrap"
              preload="intent"
              to={to}
            >
              <Icon
                className="hidden md:inline text-muted-foreground"
                name={icon}
              />
              {title}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    })}
  </SidebarMenu>
);

type SidebarProps = { authActor: typeof AuthActor };

export const Sidebar: FC<SidebarProps> = ({ authActor }) => {
  function logout() {
    authActor.send({ type: 'LOGOUT' });
  }

  return (
    <SidebarBase>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarGroup>
          <SidebarGroupLabel>PermaTrust</SidebarGroupLabel>
          <SidebarGroupContent>
            <MenuItems items={mainItems} />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <MenuItems items={bottomItems} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button onClick={logout} variant="ghost">
          Logout
        </Button>
      </SidebarFooter>
    </SidebarBase>
  );
};
