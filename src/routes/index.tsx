/* eslint-disable react-refresh/only-export-components */
import { Link, createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex max-w-2xl min-w-0 flex-col gap-4 text-sm leading-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Distribuciones continuas
        </h1>
        <p className="text-muted-foreground">
          Usa la barra lateral para navegar por las distribuciones incluidas en
          el proyecto.
        </p>
      </div>
      <Link
        to="/exponencial"
        className="inline-flex h-9 w-fit items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
      >
        Ver Exponencial
      </Link>
    </div>
  )
}
