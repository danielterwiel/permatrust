import { Outlet } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding/onboarding/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
