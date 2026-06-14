/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { GumbelMaximoDistributionPage } from "@/components/distribuciones/gumbel-maximo-page"

export const Route = createFileRoute("/gumbel-maximo")({
  component: GumbelMaximoDistributionPage,
})
