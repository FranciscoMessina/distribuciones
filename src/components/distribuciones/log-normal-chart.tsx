import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { DistribucionLogNormal } from "@/lib/distribuciones"
import type { ParamsLogNormal } from "@/lib/distribuciones/log-normal"

type Props = {
  params: ParamsLogNormal
  x?: number | null
  modo?: "izq" | "der"
}

const PUNTOS = 200

const chartConfig = {
  izq: { label: "P(X ≤ x)", color: "var(--chart-3)" },
  der: { label: "P(X > x)", color: "var(--chart-1)" },
} satisfies ChartConfig

export function LogNormalChart({ params, x, modo = "izq" }: Props) {
  const { mu, sigma } = params
  const tieneX = x != null && !isNaN(x) && x > 0

  const data = useMemo(() => {
    // Media real y percentil 99 como extremo del gráfico
    const mediaR = Math.exp(mu + 0.5 * sigma * sigma)
    const p99 = Math.exp(mu + 2.576 * sigma)
    const xMax = Math.max(p99, tieneX ? x! : 0) * 1.1
    const xMin = 0

    return Array.from({ length: PUNTOS + 1 }, (_, i) => {
      // Saltamos x=0 para evitar singularidad
      const xv = xMin + ((i + 0.5) / PUNTOS) * xMax
      const pdf = DistribucionLogNormal.pdf(xv, params)
      return {
        x: xv,
        izq: !tieneX || xv <= x! ? pdf : null,
        der: tieneX && xv >= x! ? pdf : null,
        _media: mediaR,
      }
    })
  }, [mu, sigma, x, tieneX, params])

  const tickFormatter = (v: number) => {
    const abs = Math.abs(v)
    if (abs === 0) return "0"
    if (abs >= 1000 || (abs < 0.01 && abs > 0)) return v.toExponential(1)
    return v.toFixed(abs < 1 ? 2 : 1)
  }

  const mediaR = Math.exp(mu + 0.5 * sigma * sigma)

  return (
    <ChartContainer config={chartConfig} className="h-52 w-full">
      <AreaChart data={data} margin={{ top: 22, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="x"
          type="number"
          domain={["dataMin", "dataMax"]}
          tickCount={6}
          tickFormatter={tickFormatter}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          domain={[0, "auto"]}
          tickCount={3}
          tickFormatter={(v: number) => v.toFixed(3)}
          tick={{ fontSize: 10 }}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const xv = payload?.[0]?.payload?.x
                return typeof xv === "number" ? `x = ${xv.toFixed(3)}` : ""
              }}
              formatter={(value) =>
                typeof value === "number" ? value.toFixed(4) : null
              }
            />
          }
        />

        <Area
          dataKey="izq"
          type="monotone"
          fill="var(--color-izq)"
          fillOpacity={!tieneX ? 0.25 : modo === "izq" ? 0.45 : 0.08}
          stroke="var(--color-izq)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />

        <Area
          dataKey="der"
          type="monotone"
          fill="var(--color-izq)"
          fillOpacity={!tieneX ? 0 : modo === "der" ? 0.45 : 0.08}
          stroke="var(--color-izq)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />

        {tieneX && (
          <ReferenceLine
            x={x!}
            stroke="var(--color-izq)"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            label={{
              value: `x=${tickFormatter(x!)}`,
              position: "top",
              fontSize: 10,
              fill: "var(--color-izq)",
            }}
          />
        )}

        <ReferenceLine
          x={mediaR}
          stroke="var(--muted-foreground)"
          strokeWidth={1}
          strokeDasharray="3 3"
          label={{
            value: `μ=${tickFormatter(mediaR)}`,
            position: "insideTopRight",
            fontSize: 10,
            fill: "var(--muted-foreground)",
          }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
