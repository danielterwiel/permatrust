import { useToast } from '@/hooks/use-toast';
import { createFileRoute } from '@tanstack/react-router';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { useState } from 'react';

import { api } from '@/api';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Icon } from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

import { cn } from '@/utils/cn';

import { DEFAULT_PAGINATION } from '@/consts/pagination';

import { toNumberSchema } from '@/schemas/primitives';

import type { Role } from '@/declarations/pt_backend/pt_backend.did';
import type { User } from '@/declarations/pt_backend/pt_backend.did';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles/assign',
)({
  loader: async ({ params }) => {
    const projectId = toNumberSchema.parse(params.projectId);
    const roles = await api.get_project_roles(projectId); // TODO: unlimited limit. Then: endless scroll orso
    const [users] = await api.list_project_members(
      projectId,
      DEFAULT_PAGINATION, // TODO: first: unlimited limit. Then: endless scroll + search
    );

    return {
      roles,
      users,
    };
  },
  component: RolesAssign,
});

function RolesAssign() {
  const { roles, users } = Route.useLoaderData();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [openUsers, setOpenUsers] = useState(false);
  const [openRoles, setOpenRoles] = useState(false);
  const { toast } = useToast();

  const onSubmit = async () => {
    if (selectedUsers.length === 0 || selectedRoles.length === 0) {
      toast({
        description: 'Please select at least one user and one role.',
        title: 'Error',
        variant: 'destructive',
      });
      return;
    }

    const selectedUserIds = selectedUsers.map((u) => u.id);
    const selectedRoleIds = selectedUsers.map((u) => u.id);
    await api.assign_roles({
      role_ids: selectedRoleIds,
      user_ids: selectedUserIds,
    });

    toast({
      description: `Assigned ${selectedRoles.length} role(s) to ${selectedUsers.length} user(s).`,
      title: 'Success',
    });

    setSelectedUsers([]);
    setSelectedRoles([]);
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>
          <Icon
            className="text-muted-foreground pb-1 mr-2"
            name="user-check-outline"
            size="lg"
          />
          Assign Roles to Users
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <Popover onOpenChange={setOpenUsers} open={openUsers}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={openUsers}
              className="justify-between w-full"
              variant="outline"
            >
              {selectedUsers.length > 0
                ? `${selectedUsers.length} user(s) selected`
                : 'Select users...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Search users..." />
              <CommandEmpty>No user found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-64">
                  {users.map((user: User) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => {
                        setSelectedUsers((prev) =>
                          prev.some((u) => u.id === user.id)
                            ? prev.filter((u) => u.id !== user.id)
                            : [...prev, user],
                        );
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedUsers.some((u: User) => u.id === user.id)
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {user.last_name}, {user.first_name}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        <Popover onOpenChange={setOpenRoles} open={openRoles}>
          <PopoverTrigger asChild>
            <Button
              aria-expanded={openRoles}
              className="justify-between w-full"
              variant="outline"
            >
              {selectedRoles.length > 0
                ? `${selectedRoles.length} role(s) selected`
                : 'Select roles...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Search roles..." />
              <CommandEmpty>No role found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-64">
                  {roles.map((role: Role) => (
                    <CommandItem
                      key={role.id}
                      onSelect={() => {
                        setSelectedRoles((prev: Role[]) =>
                          prev.some((r) => r.id === role.id)
                            ? prev.filter((r) => r.id !== role.id)
                            : [...prev, role],
                        );
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedRoles.some((r: Role) => r.id === role.id)
                            ? 'opacity-100'
                            : 'opacity-0',
                        )}
                      />
                      {role.name}
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onSubmit}>
          <Plus className="mr-2 h-4 w-4" /> Assign Roles
        </Button>
      </CardFooter>
    </Card>
  );
}
