import { Link } from '@tanstack/react-router';
import { Icon } from '@/components/ui/Icon';

import {
  Sidebar as SidebarBase,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  ['/nns', 'NNS', 'infinity-outline'],
  ['/organisations', 'Organisations', 'building-outline'],
  ['/projects', 'Projects', 'briefcase-outline'],
  ['/documents', 'Documents', 'file-outline'],
  ['/users', 'Users', 'users-outline'],
  ['/workflows', 'Workflows', 'file-orientation-outline'],
] as const

export function Sidebar() {
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
    </SidebarBase>
  )
}
