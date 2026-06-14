import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DistribucionUniforme, type ParamsUniforme } from "@/lib/distribuciones"

import { UniformeChart } from "./uniforme-chart"
import { ParametrosPanel } from "./parametros-panel"
import { ResultadoFila } from "./resultado-fila"

function calcOrNull<T>(input: T | null, fn: (i: T) => number): number | null {
  if (input === null) return null
  try {
    const v = fn(input)
    return isFinite(v) || isNaN(v) ? v : v
  } catch {
    return null
  }
}

export function UniformeDistributionPage() {
  const [params, setParams] = useState<ParamsUniforme | null>(null)
  const [modo, setModo] = useState<"izq" | "der">("izq")

  const [xStr, setXStr] = useState("")
  const [pStr, setPStr] = useState("")
  // Usando c y d para el intervalo de truncación (evita colisión con params a y b)
  const [cStr, setCStr] = useState("")
  const [dStr, setDStr] = useState("")

  const handleParamsChange = useCallback(
    (p: ParamsUniforme | null) => setParams(p),
    []
  )

  const x = xStr !== "" ? parseFloat(xStr) : null
  const p = pStr !== "" ? parseFloat(pStr) : null
  const c = cStr !== "" ? parseFloat(cStr) : null
  const d = dStr !== "" ? parseFloat(dStr) : null

  const xInput = x !== null && !isNaN(x) && params ? { params, x } : null
  const pInput =
    p !== null && !isNaN(p) && p > 0 && p < 1 && params ? { params, p } : null
  // EntradaDosColas usa a y b como límites del intervalo de truncación
  const cdInput =
    c !== null && d !== null && !isNaN(c) && !isNaN(d) && c < d && params
      ? { params, a: c, b: d }
      : null

  const U = DistribucionUniforme

  const probIzq = calcOrNull(xInput, (i) => U.probabilidadAcumuladaIzquierda.calcular(i))
  const probDer = calcOrNull(xInput, (i) => U.probabilidadAcumuladaDerecha.calcular(i))
  const expIzq = calcOrNull(xInput, (i) => U.expectativaParcialIzquierda.calcular(i))
  const expDer = calcOrNull(xInput, (i) => U.expectativaParcialDerecha.calcular(i))
  const promIzq = calcOrNull(xInput, (i) => U.promedioTruncadoIzquierdo.calcular(i))
  const promDer = calcOrNull(xInput, (i) => U.promedioTruncadoDerecho.calcular(i))

  const valProbIzq = calcOrNull(pInput, (i) => U.valorDadaProbabilidadIzquierda.calcular(i))
  const valProbDer = calcOrNull(pInput, (i) => U.valorDadaProbabilidadDerecha.calcular(i))

  const promDosColas = calcOrNull(cdInput, (i) => U.promedioTruncadoDosColas.calcular(i))

  function formulaValoresX(
    calculo: (typeof U)["probabilidadAcumuladaIzquierda"],
    resultado: number | null
  ) {
    if (resultado === null || xInput === null) return undefined
    return calculo.formulaConValores(xInput, resultado)
  }

  function formulaValoresP(
    calculo: (typeof U)["valorDadaProbabilidadIzquierda"],
    resultado: number | null
  ) {
    if (resultado === null || pInput === null) return undefined
    return calculo.formulaConValores(pInput, resultado)
  }

  return (
    <div className="flex gap-6">
      {/* ── Columna izquierda ── */}
      <div className="flex max-w-xl min-w-0 flex-1 flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Uniforme</h1>
          <p className="mt-1 text-sm text-muted-foreground">{U.descripcion}</p>
        </div>

        <ParametrosPanel spec={U} onParamsChange={handleParamsChange} />

        {/* ── Sección 1: dado un valor x ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dado un valor</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            <div className="items-left flex flex-col gap-3 pb-3">
              <Label
                htmlFor="sec1-x"
                className="w-16 shrink-0 text-xs text-muted-foreground"
              >
                Valor de x
              </Label>
              <Input
                id="sec1-x"
                type="number"
                placeholder="x"
                value={xStr}
                onChange={(e) => setXStr(e.target.value)}
                className="h-8 max-w-40 text-sm"
              />
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={U.probabilidadAcumuladaIzquierda.titulo}
                valor={probIzq}
                esProbabilidad
                formulaInfo={{
                  titulo: U.probabilidadAcumuladaIzquierda.titulo,
                  descripcionTeorica: U.probabilidadAcumuladaIzquierda.descripcionTeorica,
                  formulaGeneral: U.probabilidadAcumuladaIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresX(U.probabilidadAcumuladaIzquierda, probIzq),
                }}
              />
              <ResultadoFila
                titulo={U.probabilidadAcumuladaDerecha.titulo}
                valor={probDer}
                esProbabilidad
                formulaInfo={{
                  titulo: U.probabilidadAcumuladaDerecha.titulo,
                  descripcionTeorica: U.probabilidadAcumuladaDerecha.descripcionTeorica,
                  formulaGeneral: U.probabilidadAcumuladaDerecha.formulaGeneral,
                  formulaConValores: formulaValoresX(U.probabilidadAcumuladaDerecha, probDer),
                }}
              />
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={U.expectativaParcialIzquierda.titulo}
                valor={expIzq}
                formulaInfo={{
                  titulo: U.expectativaParcialIzquierda.titulo,
                  descripcionTeorica: U.expectativaParcialIzquierda.descripcionTeorica,
                  formulaGeneral: U.expectativaParcialIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresX(U.expectativaParcialIzquierda, expIzq),
                }}
              />
              <ResultadoFila
                titulo={U.expectativaParcialDerecha.titulo}
                valor={expDer}
                formulaInfo={{
                  titulo: U.expectativaParcialDerecha.titulo,
                  descripcionTeorica: U.expectativaParcialDerecha.descripcionTeorica,
                  formulaGeneral: U.expectativaParcialDerecha.formulaGeneral,
                  formulaConValores: formulaValoresX(U.expectativaParcialDerecha, expDer),
                }}
              />
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={U.promedioTruncadoIzquierdo.titulo}
                valor={promIzq}
                formulaInfo={{
                  titulo: U.promedioTruncadoIzquierdo.titulo,
                  descripcionTeorica: U.promedioTruncadoIzquierdo.descripcionTeorica,
                  formulaGeneral: U.promedioTruncadoIzquierdo.formulaGeneral,
                  formulaConValores: formulaValoresX(U.promedioTruncadoIzquierdo, promIzq),
                }}
              />
              <ResultadoFila
                titulo={U.promedioTruncadoDerecho.titulo}
                valor={promDer}
                formulaInfo={{
                  titulo: U.promedioTruncadoDerecho.titulo,
                  descripcionTeorica: U.promedioTruncadoDerecho.descripcionTeorica,
                  formulaGeneral: U.promedioTruncadoDerecho.formulaGeneral,
                  formulaConValores: formulaValoresX(U.promedioTruncadoDerecho, promDer),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Sección 2: dada una probabilidad p ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dado una probabilidad</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            <div className="flex items-center gap-3 pb-3">
              <Label
                htmlFor="sec2-p"
                className="w-16 shrink-0 text-xs text-muted-foreground"
              >
                P ∈ (0,1)
              </Label>
              <Input
                id="sec2-p"
                type="number"
                placeholder="p"
                min={0}
                max={1}
                step={0.01}
                value={pStr}
                onChange={(e) => setPStr(e.target.value)}
                className="h-8 max-w-40 text-sm"
              />
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={U.valorDadaProbabilidadIzquierda.titulo}
                valor={valProbIzq}
                formulaInfo={{
                  titulo: U.valorDadaProbabilidadIzquierda.titulo,
                  descripcionTeorica: U.valorDadaProbabilidadIzquierda.descripcionTeorica,
                  formulaGeneral: U.valorDadaProbabilidadIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresP(U.valorDadaProbabilidadIzquierda, valProbIzq),
                }}
              />
              <ResultadoFila
                titulo={U.valorDadaProbabilidadDerecha.titulo}
                valor={valProbDer}
                formulaInfo={{
                  titulo: U.valorDadaProbabilidadDerecha.titulo,
                  descripcionTeorica: U.valorDadaProbabilidadDerecha.descripcionTeorica,
                  formulaGeneral: U.valorDadaProbabilidadDerecha.formulaGeneral,
                  formulaConValores: formulaValoresP(U.valorDadaProbabilidadDerecha, valProbDer),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Sección 3: promedio truncado a dos colas ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Promedio truncado a dos colas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            <div className="flex flex-wrap items-center gap-3 pb-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="sec3-c" className="shrink-0 text-xs text-muted-foreground">
                  P (
                </Label>
                <Input
                  id="sec3-c"
                  type="number"
                  placeholder="c"
                  value={cStr}
                  onChange={(e) => setCStr(e.target.value)}
                  className="h-8 w-28 text-sm"
                />
                <Label>≤ X ≤</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="sec3-d"
                  type="number"
                  placeholder="d"
                  value={dStr}
                  onChange={(e) => setDStr(e.target.value)}
                  className="h-8 w-28 text-sm"
                />
                <Label htmlFor="sec3-d" className="w-8 shrink-0 text-xs text-muted-foreground">
                  )
                </Label>
              </div>
              {c !== null && d !== null && !isNaN(c) && !isNaN(d) && c >= d && (
                <span className="text-xs text-destructive">c debe ser menor que d</span>
              )}
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              {U.probabilidadIntervalo && (() => {
                const probInt = calcOrNull(cdInput, (i) => U.probabilidadIntervalo!.calcular(i))
                return (
                  <ResultadoFila
                    titulo={U.probabilidadIntervalo.titulo}
                    valor={probInt}
                    esProbabilidad
                    formulaInfo={{
                      titulo: U.probabilidadIntervalo.titulo,
                      descripcionTeorica: U.probabilidadIntervalo.descripcionTeorica,
                      formulaGeneral: U.probabilidadIntervalo.formulaGeneral,
                      formulaConValores:
                        probInt !== null && cdInput !== null
                          ? U.probabilidadIntervalo.formulaConValores(cdInput, probInt)
                          : undefined,
                    }}
                  />
                )
              })()}
              <ResultadoFila
                titulo={U.promedioTruncadoDosColas.titulo}
                valor={promDosColas}
                formulaInfo={{
                  titulo: U.promedioTruncadoDosColas.titulo,
                  descripcionTeorica: U.promedioTruncadoDosColas.descripcionTeorica,
                  formulaGeneral: U.promedioTruncadoDosColas.formulaGeneral,
                  formulaConValores:
                    promDosColas !== null && cdInput !== null
                      ? U.promedioTruncadoDosColas.formulaConValores(cdInput, promDosColas)
                      : undefined,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Columna derecha: gráfico sticky ── */}
      {params && (
        <div className="sticky mt-30 shrink-0">
          <Card>
            <CardContent className="p-3">
              {x !== null && !isNaN(x) && (
                <div className="mb-2 flex justify-center gap-1">
                  <Button
                    size="xs"
                    variant={modo === "izq" ? "default" : "ghost"}
                    onClick={() => setModo("izq")}
                  >
                    P(X ≤ x)
                  </Button>
                  <Button
                    size="xs"
                    variant={modo === "der" ? "default" : "ghost"}
                    onClick={() => setModo("der")}
                  >
                    P(X &gt; x)
                  </Button>
                </div>
              )}
              <UniformeChart params={params} x={x} modo={modo} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
