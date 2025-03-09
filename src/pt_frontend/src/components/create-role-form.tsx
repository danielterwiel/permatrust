import { permissionsToItems } from '@/utils';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

import { mutations } from '@/api/mutations';

import { Input } from '@/components/input';
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
import { Textarea } from '@/components/ui/textarea';

import { createZodFieldValidator } from '@/utils/create-zod-field-validator';
import { createPermissionVariant } from '@/utils/variants/permissions';

import { projectIdSchema } from '@/schemas/entities';
import { capitalizeFirstLetterValidator } from '@/schemas/form';

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
  project: Project;
};

type FormValues = {
  description?: string;
  name: string;
  permissions: {
    available: Item[];
    selected: Item[];
  };
};

export function CreateRoleForm({ permissions, project }: CreateRoleFormProps) {
  const { isPending: isSubmitting, mutateAsync: createRole } =
    mutations.useCreateRole();
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
      const permissions = value.permissions.selected.map((p) => {
        const [entityName, permission] = p.id.split('::');
        if (!entityName || !permission) {
          throw new Error('Entity not found');
        }
        const entityPermission = createPermissionVariant(
          entityName,
          permission,
        );
        return entityPermission;
      });
      const projectIdParsed = projectIdSchema.parse(project.id);
      await createRole({
        description: value.description ? [value.description] : [],
        name: value.name,
        permissions,
        project_id: projectIdParsed,
      });
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

  return !project ? (
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
      <form.Field
        name="name"
        validators={{
          onChange: capitalizeFirstLetterValidator,
          onSubmit: createZodFieldValidator(createRoleFormSchema, 'name'),
        }}
      >
        {(field) => (
          <FormItem>
            <FormLabel field={field}>Name</FormLabel>
            <FormControl field={field}>
              <Input
                onBlur={field.handleBlur}
                onChange={(value) => field.handleChange(value)}
                placeholder="e.g. Administrators"
                value={field.state.value}
              />
            </FormControl>
            <FormDescription>This is your role name.</FormDescription>
            <FormMessage field={field} />
          </FormItem>
        )}
      </form.Field>

      <form.Field
        name="description"
        validators={{
          onSubmit: createZodFieldValidator(
            createRoleFormSchema,
            'description',
          ),
        }}
      >
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
