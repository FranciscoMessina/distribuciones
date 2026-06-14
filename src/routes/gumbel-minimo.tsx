/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { DistributionPage } from "@/components/distribution-page"

export const Route = createFileRoute("/gumbel-minimo")({
  component: GumbelMinimoPage,
})

function GumbelMinimoPage() {
  return (
    <DistributionPage
      title="Gumbel mínimo"
      description="Revisa la versión mínima de la distribución de Gumbel."
    />
  )
}
