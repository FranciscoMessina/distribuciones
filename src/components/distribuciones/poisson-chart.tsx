import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DistribucionPoisson } from "@/lib/distribuciones"
import type { ParamsPoisson } from "@/lib/distribuciones/poisson"

type Props = {
  params: ParamsPoisson
  r?: number | null
  modo?: "izq" | "der"
}

const chartConfig = {
  izq: { label: "P(X ≤ r)", color: "var(--chart-3)" },
  der: { label: "P(X ≥ r)", color: "var(--chart-1)" },
} satisfies ChartConfig

export function PoissonChart({ params, r, modo = "izq" }: Props) {
  const { m } = params
  const tieneR = r != null && !isNaN(r) && r >= 0

  const data = useMemo(() => {
    const naturalMax = Math.ceil(m + 5 * Math.sqrt(m + 1) + 10)
    const maxR = Math.min(
      tieneR ? Math.max(naturalMax, r! + 5) : naturalMax,
      80
    )
    return Array.from({ length: maxR + 1 }, (_, i) => ({
      r: i,
      prob: DistribucionPoisson.pdf(i, params),
    }))
  }, [m, params, tieneR, r])

  const tickInterval = Math.max(1, Math.floor(data.length / 10))

  return (
    <ChartContainer config={chartConfig} className="h-52 w-full">
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="r"
          tick={{ fontSize: 10 }}
          interval={tickInterval - 1}
        />
        <YAxis
          domain={[0, "auto"]}
          tickCount={4}
          tickFormatter={(v: number) => v.toFixed(3)}
          tick={{ fontSize: 10 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={() => ``}
              formatter={(value) =>
                typeof value === "number" ? value.toFixed(4) : null
              }
            />
          }
        />
        <Bar dataKey="prob" isAnimationActive={false}>
          {data.map(({ r: ri }) => {
            if (!tieneR) {
              return (
                <Cell key={ri} fill="var(--color-izq)" fillOpacity={0.45} />
              )
            }
            const highlighted = modo === "izq" ? ri <= r! : ri >= r!
            return (
              <Cell
                key={ri}
                fill={modo === "izq" ? "var(--color-izq)" : "var(--color-der)"}
                fillOpacity={highlighted ? 0.8 : 0.12}
              />
            )
          })}
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
