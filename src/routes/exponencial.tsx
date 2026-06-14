/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router"

import { ExponencialDistributionPage } from "@/components/distribuciones/exponencial-page"

export const Route = createFileRoute("/exponencial")({
  component: ExponencialDistributionPage,
})
