/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { UniformeDistributionPage } from "@/components/distribuciones/uniforme-page"

export const Route = createFileRoute("/uniforme")({
  component: UniformePage,
})

function UniformePage() {
  return <UniformeDistributionPage />
}
