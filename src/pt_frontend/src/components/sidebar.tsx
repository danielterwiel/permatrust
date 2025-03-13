
import { Link } from '@tanstack/react-router';

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

import type { authActor as AuthActor } from '@/machines/auth-machine';
import type { FC } from 'react';

type SidebarProps = { authActor: typeof AuthActor };

export const Sidebar: FC<SidebarProps> = ({ authActor }) => {
  const items = [
    ['/organizations', 'Organizations', 'building-outline'],
    ['/projects', 'Projects', 'briefcase-outline'],
    ['/documents', 'Documents', 'files-outline'],
    ['/users', 'Users', 'users-outline'],
    ['/workflows', 'Workflows', 'file-orientation-outline'],
  ] as const;

  function logout() {
    authActor.send({ type: 'LOGOUT' });
  }

  return (
    <SidebarBase>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>PermaTrust</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map(([to, title, icon]) => (
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
              ))}
            </SidebarMenu>
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
