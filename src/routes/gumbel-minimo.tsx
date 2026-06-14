/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { GumbelMinimoDistributionPage } from "@/components/distribuciones/gumbel-minimo-page"

export const Route = createFileRoute("/gumbel-minimo")({
  component: GumbelMinimoPage,
})

function GumbelMinimoPage() {
  return <GumbelMinimoDistributionPage />
}
