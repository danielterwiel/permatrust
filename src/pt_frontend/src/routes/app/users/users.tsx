import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'

const projectsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
})

export const Route = createFileRoute('/_authenticated/users/')({
  component: Users,
  validateSearch: (search) => projectsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context }) => {
    return {
      ...context,
    }
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>
  },
})

function Users() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Users</CardTitle>
        <CardDescription>
          TODO: don't know what to do with this page
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
