import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/quiz/$q')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/index/$q"!</div>
}
