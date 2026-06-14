/* eslint-disable react-refresh/only-export-components */
import { Link, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/about")({
  component: AboutPage,
})

function AboutPage() {
  return (
    <div className="max-w-md space-y-3 text-sm leading-loose">
      <h1 className="font-medium">About</h1>
      <p>
        This page is rendered by TanStack Router and uses the shared layout from
        the root route.
      </p>
      <Link
        to="/"
        className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        Back home
      </Link>
    </div>
  )
}
