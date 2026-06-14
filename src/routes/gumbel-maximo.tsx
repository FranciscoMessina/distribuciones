/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { DistributionPage } from "@/components/distribution-page"

export const Route = createFileRoute("/gumbel-maximo")({
  component: GumbelMaximoPage,
})

function GumbelMaximoPage() {
  return (
    <DistributionPage
      title="Gumbel máximo"
      description="Revisa la versión máxima de la distribución de Gumbel."
    />
  )
}
