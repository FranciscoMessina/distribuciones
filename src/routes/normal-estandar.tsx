/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { DistributionPage } from "@/components/distribution-page"

export const Route = createFileRoute("/normal-estandar")({
  component: NormalEstandarPage,
})

function NormalEstandarPage() {
  return (
    <DistributionPage
      title="Normal estándar"
      description="Consulta la forma estándar de la distribución normal."
    />
  )
}
