import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import { mutations } from '@/api/mutations';
import { getProjectRolesOptions } from '@/api/queries/access-control';
import { listUsersByProjectIdOptions } from '@/api/queries/users';
import { useToast } from '@/hooks/use-toast';
import {
  projectIdSchema,
  roleIdSchema,
  userIdSchema,
} from '@/schemas/entities';
import { cn } from '@/utils/cn';

import { RolesList } from '@/components/roles-list';
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

import type { Role, User } from '@/declarations/pt_backend/pt_backend.did';

const searchSchema = z.object({
  userId: z.number().optional(),
});

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles/assign',
)({
  validateSearch: zodSearchValidator(searchSchema),
  loaderDeps: ({ search }) => ({
    userId: search.userId,
  }),
  loader: async ({ context, deps, params }) => {
    const projectId = projectIdSchema.parse(params.projectId);
    const roles = await context.query.ensureQueryData(
      getProjectRolesOptions(projectId),
    );

    const [users] = await context.query.ensureQueryData(
      listUsersByProjectIdOptions(projectId),
    );

    console.log('users', users);

    let preselectedUser: User | undefined;
    let userRoles: Array<Role> = [];

    if (deps.userId !== undefined && !Number.isNaN(deps.userId)) {
      const userId = deps.userId;
      preselectedUser = users.find((user) => user.id === BigInt(userId));

      if (preselectedUser && Array.isArray(preselectedUser.roles)) {
        userRoles = preselectedUser.roles;
      }
    }

    return {
      preselectedUser,
      roles,
      userRoles,
      users,
    };
  },
  component: RolesAssign,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function RolesAssign() {
  const { preselectedUser, roles, userRoles, users } = Route.useLoaderData();
  const search = Route.useSearch();
  const [selectedUsers, setSelectedUsers] = useState<Array<User>>(
    preselectedUser ? [preselectedUser] : [],
  );

  const [selectedRoles, setSelectedRoles] = useState<Array<Role>>(userRoles);
  const [openUsers, setOpenUsers] = useState(false);
  const [openRoles, setOpenRoles] = useState(false);
  const { toast } = useToast();

  const assignRolesMutation = mutations.useAssignRoles();

  const onSubmit = async () => {
    if (selectedUsers.length === 0 || selectedRoles.length === 0) {
      toast({
        description: 'Please select at least one user and one role.',
        title: 'Error',
        variant: 'destructive',
      });
      return;
    }

    const selectedUserIds = selectedUsers.map((u) => userIdSchema.parse(u.id));
    const selectedRoleIds = selectedRoles.map((r) => roleIdSchema.parse(r.id));

    try {
      await assignRolesMutation.mutateAsync({
        role_ids: selectedRoleIds,
        user_ids: selectedUserIds,
      });

      toast({
        description: `Assigned ${selectedRoles.length} role(s) to ${selectedUsers.length} user(s).`,
        title: 'Success',
      });

      setSelectedUsers([]);
      setSelectedRoles([]);
    } catch (error: unknown) {
      toast({
        description: `Failed to assign roles. Please try again. Error: ${error}`,
        title: 'Error',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="pt-4">
      <Card>
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
                disabled={!!search.userId}
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
                          setSelectedRoles((prev: Array<Role>) =>
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
        <CardFooter className="flex flex-col gap-4 items-start">
          <Button onClick={onSubmit}>Assign Roles</Button>

          {preselectedUser && userRoles.length > 0 && (
            <div className="w-full mt-4">
              <h3 className="text-lg font-medium mb-2">Current Roles</h3>
              <RolesList roles={userRoles} />
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
