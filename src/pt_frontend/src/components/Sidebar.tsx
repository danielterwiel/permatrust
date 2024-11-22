import { Link } from '@tanstack/react-router';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/button';
import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';
import type { FC } from 'react';
import type { authActor } from '@/machines/auth-machine';

type SidebarProps = { authActor: typeof authActor };

export const Sidebar: FC<SidebarProps> = ({ authActor }) => {
  const items = [
    ['/organisations', 'Organisations', 'building-outline'],
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
                      to={to}
                      activeOptions={
                        {
                          // If the route points to the root of it's parent,
                          // make sure it's only active if it's exact
                          // exact: to === '.',
                        }
                      }
                      preload="intent"
                      className="block py-2 px-3 text-nowrap"
                      activeProps={{ className: 'font-bold' }}
                    >
                      <Icon
                        name={icon}
                        className="hidden md:inline text-muted-foreground"
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
