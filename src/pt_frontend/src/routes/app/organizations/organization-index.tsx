import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organizations/$organizationId',
)({
  beforeLoad: () => ({
    getTitle: () => 'Organization',
  }),
  component: OrganizationId,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>
  },
})

function OrganizationId() {
  return <Outlet />
}
