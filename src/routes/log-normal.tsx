/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { LogNormalDistributionPage } from "@/components/distribuciones/log-normal-page"

export const Route = createFileRoute("/log-normal")({
  component: LogNormalPage,
})

function LogNormalPage() {
  return <LogNormalDistributionPage />
}
