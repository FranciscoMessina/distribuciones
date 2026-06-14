/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { WeibullDistributionPage } from "@/components/distribuciones/weibull-page"

export const Route = createFileRoute("/weibull")({
  component: WeibullPage,
})

function WeibullPage() {
  return <WeibullDistributionPage />
}
