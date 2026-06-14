/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { ParetoDistributionPage } from "@/components/distribuciones/pareto-page"

export const Route = createFileRoute("/pareto")({
  component: ParetoPage,
})

function ParetoPage() {
  return <ParetoDistributionPage />
}
