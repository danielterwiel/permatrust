import { createFileRoute } from '@tanstack/react-router'
import { pt_backend } from '@/declarations/pt_backend'
import { Table } from '@/components/Table'
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject'
import { Principal } from '@dfinity/principal'
import { handleResult } from '@/utils/handleResult'
import { DEFAULT_PAGINATION } from '@/consts/pagination'
import { z } from 'zod'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import { formatDateTime } from '@/utils/date'

const projectsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
})

export const Route = createFileRoute('/_authenticated/projects')({
  component: Projects,
  validateSearch: (search) => projectsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    }
    const response = await pt_backend.list_projects(pagination)
    const result = handleResult(response)
    const [projects, paginationMetaData] = stringifyBigIntObject(result)
    return {
      ...context,

      projects,
      paginationMetaData,
    }
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>
  },
})

function Projects() {
  const { projects, paginationMetaData } = Route.useLoaderData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>View all your projects</CardDescription>
      </CardHeader>
      <CardContent>
        <Table
          tableData={projects}
          showOpenEntityButton={true}
          routePath=""
          paginationMetaData={paginationMetaData}
          columnConfig={[
            {
              id: 'name',
              headerName: 'Project Name',
              cellPreprocess: (v) => v,
            },
            {
              id: 'created_by',
              headerName: 'Created by',
              cellPreprocess: (createdBy) =>
                Principal.fromUint8Array(createdBy).toString(),
            },
            {
              id: 'created_at',
              headerName: 'Created at',
              cellPreprocess: (createdAt) => formatDateTime(createdAt),
            },
          ]}
        />
      </CardContent>
    </Card>
  )
}
