import { useDebouncedWatch } from '@/hooks/useDebouncedWatch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { filterCriteriaToFilterFieldName } from '@/utils/filterCriteriaToFilterFieldName';

import { filterCriteriaSchema } from '@/schemas/pagination';

import type { FilterCriteria } from '@/declarations/pt_backend/pt_backend.did';
import type { ComponentProps } from 'react';

type FilterProps = Omit<ComponentProps<typeof Input>, 'onChange'> & {
  filterCriteria: FilterCriteria;
  onChange?: (value: FilterCriteria) => void;
  placeholder: string;
};

export const FilterInput = ({
  filterCriteria,
  onChange,
  placeholder,
  ...inputProps
}: FilterProps) => {
  const form = useForm<FilterCriteria>({
    defaultValues: {
      entity: filterCriteria.entity,
      field: filterCriteria.field,
      operator: filterCriteria.operator,
    },
    mode: 'onChange',
    resolver: zodResolver(filterCriteriaSchema),
  });

  const fieldName = filterCriteriaToFilterFieldName(
    filterCriteria,
  ) as keyof FilterCriteria;

  useDebouncedWatch(form.watch, (value: Partial<FilterCriteria>) => {
    onChange?.({
      entity: filterCriteria.entity,
      field: filterCriteria.field,
      operator: filterCriteria.operator,
      value: value[fieldName] as string,
    });
  });

  return (
    <Form {...form}>
      <form className="flex items-center" onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name={fieldName}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">{placeholder}</FormLabel>
              <FormControl>
                <Input
                  {...inputProps}
                  {...field}
                  aria-label={placeholder}
                  className="h-8 w-[250px] lg:w-[350px] text-sm"
                  placeholder={placeholder}
                  type="text"
                  value={String(field.value || filterCriteria.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
