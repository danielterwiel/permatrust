import { capitalizeFirstLetter, permissionsToItems } from '@/utils';
import { useForm } from '@tanstack/react-form';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { api } from '@/api';

import { Link } from '@/components/link';
import { Loading } from '@/components/loading';
import {
  type Item,
  MultiSelectTransfer,
} from '@/components/multi-select-transfer';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { createPermissionVariant } from '@/utils/variants/permissions';

import { toNumberSchema } from '@/schemas/primitives';

import type {
  Permission,
  Project,
} from '@/declarations/pt_backend/pt_backend.did';

export const createRoleFormSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(2, {
    message: 'Role name must be at least 2 characters.',
  }),
});

type CreateRoleFormProps = {
  permissions: Permission[];
  projectId: string;
};

type FormValues = {
  description?: string;
  name: string;
  permissions: {
    available: Item[];
    selected: Item[];
  };
};

export function CreateRoleForm({
  permissions,
  projectId,
}: CreateRoleFormProps) {
  const [projects, setProjects] = useState<Project[] | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const getProjects = async () => {
      const projectsResult = await api.get_projects();
      setProjects(projectsResult);
    };
    if (!projects) {
      getProjects();
    }
  }, [projects]);
  const availablePermissions = permissionsToItems(permissions);

  const form = useForm<FormValues>({
    defaultValues: {
      description: '',
      name: '',
      permissions: {
        available: availablePermissions,
        selected: [],
      },
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      const permissions = value.permissions.selected.map((p) => {
        const [entityName, permission] = p.id.split('::');
        if (!entityName || !permission) {
          throw new Error('Entity not found');
        }
        const entity = capitalizeFirstLetter(entityName);
        const entityPermission = createPermissionVariant(entity, permission);
        return entityPermission;
      });
      try {
        const projectIdParsed = toNumberSchema.parse(projectId);
        await api.create_role({
          description: value.description ? [value.description] : [],
          name: value.name,
          permissions,
          project_id: projectIdParsed,
        });
      } catch (_error) {
        // TODO: handle error
      }
      setIsSubmitting(false);
    },
  });

  const handleTransfer = (items: Item[], direction: 'left' | 'right') => {
    form.setFieldValue('permissions', (prev) => {
      const newAvailable =
        direction === 'left'
          ? [...prev.available, ...items]
          : prev.available.filter(
              (item) => !items.find((i) => i.id === item.id),
            );

      const newSelected =
        direction === 'right'
          ? [...prev.selected, ...items]
          : prev.selected.filter(
              (item) => !items.find((i) => i.id === item.id),
            );

      return {
        available: newAvailable,
        selected: newSelected,
      };
    });
  };

  if (!projects) {
    return <Loading text="Loading project" />;
  }

  return projects.length === 0 ? (
    <div>
      No projects found to assign roles to. First{' '}
      <Link to="/projects/create">create a project</Link>
    </div>
  ) : (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="name">
        {(field) => (
          <FormItem>
            <FormLabel field={field}>Name</FormLabel>
            <FormControl field={field}>
              <Input
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. Administrators"
                value={field.state.value}
              />
            </FormControl>
            <FormDescription>This is your role name.</FormDescription>
            <FormMessage field={field} />
          </FormItem>
        )}
      </form.Field>

      <form.Field name="description">
        {(field) => (
          <FormItem>
            <FormLabel field={field}>Description</FormLabel>
            <FormControl field={field}>
              <Textarea
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="e.g. Management team"
                value={field.state.value}
              />
            </FormControl>
            <FormDescription>This is your role description.</FormDescription>
            <FormMessage field={field} />
          </FormItem>
        )}
      </form.Field>

      <form.Field name="permissions">
        {(field) => (
          <FormItem>
            <FormLabel field={field}>Actions</FormLabel>
            <FormControl field={field}>
              <MultiSelectTransfer
                availableItems={field.state.value.available}
                description="Drag and drop or select the actions for this role."
                onTransfer={handleTransfer}
                selectedItems={field.state.value.selected}
                title="Actions"
              />
            </FormControl>
            <FormDescription>Manage your roles.</FormDescription>
            <FormMessage field={field} />
          </FormItem>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => [state.isSubmitting]}>
        {([submitting]) =>
          isSubmitting || submitting ? (
            <Button disabled={true}>
              <Loading text="Creating..." />
            </Button>
          ) : (
            <Button type="submit">Create role</Button>
          )
        }
      </form.Subscribe>
    </form>
  );
}
