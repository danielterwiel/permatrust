import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

import { mutations } from '@/api/mutations';
import { projectIdSchema } from '@/schemas/entities';
import { capitalizeFirstLetterValidator } from '@/schemas/form';
import { createZodFieldValidator } from '@/utils/create-zod-field-validator';
import { createPermissionVariant } from '@/utils/variants/permissions';

import { Input } from '@/components/input';
import { Loading } from '@/components/loading';
import { MultiSelectTransfer } from '@/components/multi-select-transfer';
import type { MultiSelectItem } from '@/components/multi-select-transfer';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

import type {
  Permission,
  Project,
} from '@/declarations/tenant_canister/tenant_canister.did';

import { permissionsToItems } from '@/utils';

export const createRoleFormSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(2, {
    message: 'Role name must be at least 2 characters.',
  }),
});

type CreateRoleFormProps = {
  permissions: Array<Permission>;
  project: Project;
};

type FormValues = {
  description?: string;
  name: string;
  permissions: {
    available: Array<MultiSelectItem>;
    selected: Array<MultiSelectItem>;
  };
};

export function CreateRoleForm({ permissions, project }: CreateRoleFormProps) {
  const { isPending: isSubmitting, mutate: createRole } =
    mutations.tenant.useCreateRole();
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
      const selectedPermissions = value.permissions.selected.map((p) => {
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
        permissions: selectedPermissions,
        project_id: projectIdParsed,
      });
    },
  });

  const handleTransfer = (
    items: Array<MultiSelectItem>,
    direction: 'left' | 'right',
  ) => {
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

  return (
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
