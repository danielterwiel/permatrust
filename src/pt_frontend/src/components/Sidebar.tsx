import { useMemo } from 'react';
import { Link } from "@tanstack/react-router";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/button";
import type { AuthContext } from "@/context/auth";

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
} from "@/components/ui/sidebar";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function Sidebar({ auth }: { auth: AuthContext }) {
  const [activeOrganisationId] = useLocalStorage("activeOrganisationId", "");


  const items = useMemo(() => {
    const allItems = [
      ["/nns", "NNS", "infinity-outline"],
      ["/organisations", "Organisations", "building-outline"],
      ["/projects", "Projects", "briefcase-outline"],
      ["/documents", "Documents", "file-outline"],
      ["/users", "Users", "users-outline"],
      ["/workflows", "Workflows", "file-orientation-outline"],
    ] as const;

    return allItems.filter(item =>
      item[1] !== "Documents" || Boolean(activeOrganisationId)
    );
  }, [activeOrganisationId]);
  const logout = () => {
    auth.logout();
  };

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
                      activeProps={{ className: "font-bold" }}
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
}
