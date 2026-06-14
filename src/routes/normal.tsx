/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { NormalDistributionPage } from "@/components/distribuciones/normal-page"

export const Route = createFileRoute("/normal")({
  component: NormalPage,
})

function NormalPage() {
  return <NormalDistributionPage />
}
