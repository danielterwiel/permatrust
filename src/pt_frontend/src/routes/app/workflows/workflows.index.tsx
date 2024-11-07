import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/_onboarded/workflows')({
  component: Workflows,
  beforeLoad: () => ({
    getTitle: () => 'Workflows',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>
  },
})

function Workflows() {
  return <Outlet />
}
