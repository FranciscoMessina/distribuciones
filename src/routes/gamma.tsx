/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { GammaDistributionPage } from "@/components/distribuciones/gamma-page"

export const Route = createFileRoute("/gamma")({
  component: GammaDistributionPage,
})
