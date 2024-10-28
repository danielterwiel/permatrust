import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { filterCriteriaSchema } from "@/schemas/pagination";
import { filterCriteriaToFilterFieldName } from "@/utils/filterCriteriaToFilterFieldName";
import { useDebouncedWatch } from "@/hooks/useDebouncedWatch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentProps } from "react";
import type { FilterCriteria } from "@/declarations/pt_backend/pt_backend.did";

type FilterProps = Omit<ComponentProps<typeof Input>, "onChange"> & {
  filterCriteria: FilterCriteria;
  placeholder: string;
  onChange?: (value: FilterCriteria) => void;
};

export const FilterInput = ({
  filterCriteria,
  placeholder,
  onChange,
  ...inputProps
}: FilterProps) => {
  const form = useForm<FilterCriteria>({
    resolver: zodResolver(filterCriteriaSchema),
    defaultValues: {
      entity: filterCriteria.entity,
      field: filterCriteria.field,
      operator: filterCriteria.operator,
    },
    mode: "onChange",
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
                  placeholder={placeholder}
                  aria-label={placeholder}
                  value={String(field.value || filterCriteria.value)}
                  className="h-8 w-[250px] lg:w-[350px] text-sm"
                  type="text"
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
