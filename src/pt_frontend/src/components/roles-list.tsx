import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

import { Link } from '@/components/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  return (
    <>
      <div className="container mx-auto p-4 space-y-6">
        {roles.map((role) => (
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
                <ScrollArea className="h-[100px] w-full rounded-md border p-4">
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map((permission) => (
                      <Badge
                        className="transition-all hover:scale-105"
                        key={permission.toString()}
                        variant="secondary"
                      >
                        {permission.toString()}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </>
  );
};
