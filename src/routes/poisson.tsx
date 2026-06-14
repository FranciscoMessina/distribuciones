/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { PoissonDistributionPage } from "@/components/distribuciones/poisson-page"

export const Route = createFileRoute("/poisson")({
  component: PoissonDistributionPage,
})
