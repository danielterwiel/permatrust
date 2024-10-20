import { z } from "zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createFileRoute } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { storage } from "@/utils/localStorage";
import { useDebounce } from "@/hooks/useDebounce";
import { Table } from "@/components/Table";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/Link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Row } from "@tanstack/react-table";
import type {
  Document,
  SortCriteria,
  FilterCriteria,
  SortOrder,
} from "@/declarations/pt_backend/pt_backend.did";
import type { _SERVICE } from "@/declarations/pt_backend/pt_backend.did.d";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterCriteriaSchema } from "@/schemas/FilterCriteriaSchema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DEFAULT_PAGINATION } from "@/consts/pagination";

const documentsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
  filters: z.array(FilterCriteriaSchema).optional(),
});

export const Route = createFileRoute("/_authenticated/documents")({
  component: Documents,
  validateSearch: (search) => documentsSearchSchema.parse(search),
  beforeLoad: () => ({
    getTitle: () => "Documents",
  }),
  loaderDeps: ({ search: { page, filters } }) => ({ page, filters }),
  loader: async ({ context, deps: { page, filters } }) => {
    const activeOrganisationId = storage.getItem("activeOrganisationId", "");

    if (!activeOrganisationId) {
      throw new Error("No activeOrganisationId found");
    }
    const docPagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
      filters: [
        [
          {
            field: { Title: null },
            value: filters?.[0]?.value ?? "",
            operator: { Contains: null },
          },
        ],
      ] as [FilterCriteria[]],
      sort: [
        {
          field: { Title: null },
          order: { Asc: null } as SortOrder,
        },
      ] as [SortCriteria],
    };
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const [projects] = await context.api.call.list_projects_by_organisation_id(
      BigInt(activeOrganisationId),
      pagination,
      {
        onErr: (error) => {
          console.error(error);
        },
      },
    );

    const [documents, paginationMetaData] =
      await context.api.call.list_documents(docPagination);
    return {
      context,
      projects,
      documents,
      paginationMetaData,
      page,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<Document>) => {
  return (
    <Link
      to="/projects/$projectId/documents/$documentId"
      variant="outline"
      params={{
        projectId: row.original.project.toString(),
        documentId: row.id,
      }}
    >
      Open
    </Link>
  );
};

const Filter = () => {
  const [isQuerying, setIsQuerying] = useState(false);
  const navigate = Route.useNavigate();
  const search = Route.useSearch();

  const formSchema = z.object({
    filter_title: z.string(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    disabled: isQuerying,
    defaultValues: {
      filter_title: search?.filters?.[0]?.value ?? "",
    },
  });

  const debouncedFilterTitle = useDebounce(form.watch("filter_title"), 300);

  useEffect(() => {
    if (debouncedFilterTitle !== search?.filters?.[0]?.value) {
      onSubmit({ filter_title: debouncedFilterTitle });
    }
  }, [debouncedFilterTitle, search?.filters?.[0]?.value]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsQuerying(true);
      navigate({
        search: {
          filters: [
            {
              field: { Title: null },
              value: values.filter_title,
              operator: { Contains: null },
            },
          ] as FilterCriteria[],
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsQuerying(false);
    }
  }

  return (
    <div className="w-full gap-4">
      <Form {...form}>
        <form className="flex items-center">
          <FormField
            control={form.control}
            name="filter_title"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Filter</FormLabel>
                <FormControl>
                  <Input
                    className="h-8 w-[250px] lg:w-[350px] text-sm"
                    placeholder="Filter document title..."
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.trigger("filter_title");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

function Documents() {
  const { documents, projects, paginationMetaData } = Route.useLoaderData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>();

  return (
    <>
      <div className="pb-4 flex items-center">
        <Filter />
        {projects.length === 1 ? (
          <Link
            to="/projects/$projectId/documents/create"
            params={{ projectId: projects[0]?.id.toString() }}
            variant="default"
            className="h-7 gap-1"
            size="sm"
          >
            <Icon name="file-outline" size="sm" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create document
            </span>
          </Link>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default" size="sm">
                <Icon name="file-outline" size="xs" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Create document
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mr-8">
              <Select
                onValueChange={(projectId) => setSelectedProjectId(projectId)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Projects</SelectLabel>
                    {projects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id.toString()}
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Link
                to="/projects/$projectId/documents/create"
                params={{ projectId: selectedProjectId }}
                variant="default"
                disabled={!selectedProjectId}
                className="mt-4"
              >
                <Icon name="file-outline" size="sm" className="mr-2" />
                Create document
              </Link>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              name="files-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Document>
            tableData={documents}
            actions={RowActions}
            paginationMetaData={paginationMetaData}
            columnConfig={[
              {
                id: "title",
                headerName: "Document title",
                cellPreprocess: (title) => title,
              },
              {
                id: "current_version",
                headerName: "Version",
                cellPreprocess: (version) => version,
              },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
