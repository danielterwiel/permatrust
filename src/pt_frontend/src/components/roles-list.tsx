import { permissionsToItems } from '@/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import type { Role } from '@/declarations/pt_backend/pt_backend.did';

type RoleListProps = {
  roles: Role[];
};

export const RolesList = ({ roles }: RoleListProps) => {
  const [expandedRoles, setExpandedRoles] = useState<string[]>([]);

  const toggleRole = (roleId: string) => {
    setExpandedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const groupPermissions = (
    permissions: ReturnType<typeof permissionsToItems>,
  ) => {
    return permissions.reduce(
      (acc, permission) => {
        if (!acc[permission.group]) {
          acc[permission.group] = [];
        }
        acc[permission.group]?.push(permission);
        return acc;
      },
      {} as Record<string, typeof permissions>,
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {roles.map((role) => {
        const permissions = permissionsToItems(role.permissions);
        const groupedPermissions = groupPermissions(permissions);
        return (
          <Card className="w-full" key={role.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{role.name}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
                <Button
                  onClick={() => toggleRole(role.id.toString())}
                  size="icon"
                  variant="ghost"
                >
                  {expandedRoles.includes(role.id.toString()) ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            {expandedRoles.includes(role.id.toString()) && (
              <CardContent>
                <Accordion className="w-full" type="multiple">
                  {Object.entries(groupedPermissions).map(([group, perms]) => (
                    <AccordionItem key={group} value={group}>
                      <AccordionTrigger>{group}</AccordionTrigger>
                      <AccordionContent>
                        <div className="flex flex-wrap gap-2">
                          {perms.map((permission) => (
                            <Badge
                              className="transition-all hover:scale-105"
                              key={permission.id}
                              variant="secondary"
                            >
                              {permission.label}
                            </Badge>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};
