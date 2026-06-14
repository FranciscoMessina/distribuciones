import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DistribucionWeibull, type ParamsWeibull } from "@/lib/distribuciones"
import { numeroLatex } from "@/lib/distribuciones/formato"
import { modaWeibull } from "@/lib/distribuciones/weibull"

import { ParametrosPanel } from "./parametros-panel"
import { WeibullChart } from "./weibull-chart"
import { ResultadoFila } from "./resultado-fila"

function calcOrNull<T>(input: T | null, fn: (i: T) => number): number | null {
  if (input === null) return null
  try {
    const r = fn(input)
    return isFinite(r) ? r : null
  } catch {
    return null
  }
}

export function WeibullDistributionPage() {
  const [params, setParams] = useState<ParamsWeibull | null>(null)
  const [modo, setModo] = useState<"izq" | "der">("izq")

  const [xStr, setXStr] = useState("")
  const [pStr, setPStr] = useState("")
  const [aStr, setAStr] = useState("")
  const [bStr, setBStr] = useState("")

  const handleParamsChange = useCallback(
    (p: ParamsWeibull | null) => setParams(p),
    []
  )

  const x = xStr !== "" ? parseFloat(xStr) : null
  const p = pStr !== "" ? parseFloat(pStr) : null
  const a = aStr !== "" ? parseFloat(aStr) : null
  const bLim = bStr !== "" ? parseFloat(bStr) : null

  const xInput =
    x !== null && !isNaN(x) && x >= 0 && params ? { params, x } : null
  const pInput =
    p !== null && !isNaN(p) && p > 0 && p < 1 && params ? { params, p } : null
  const abInput =
    a !== null &&
    bLim !== null &&
    !isNaN(a) &&
    !isNaN(bLim) &&
    a >= 0 &&
    a < bLim &&
    params
      ? { params, a, b: bLim }
      : null

  const W = DistribucionWeibull

  const probIzq = calcOrNull(xInput, (i) => W.probabilidadAcumuladaIzquierda.calcular(i))
  const probDer = calcOrNull(xInput, (i) => W.probabilidadAcumuladaDerecha.calcular(i))
  const expIzq = calcOrNull(xInput, (i) => W.expectativaParcialIzquierda.calcular(i))
  const expDer = calcOrNull(xInput, (i) => W.expectativaParcialDerecha.calcular(i))
  const promIzq = calcOrNull(xInput, (i) => W.promedioTruncadoIzquierdo.calcular(i))
  const promDer = calcOrNull(xInput, (i) => W.promedioTruncadoDerecho.calcular(i))

  const valProbIzq = calcOrNull(pInput, (i) => W.valorDadaProbabilidadIzquierda.calcular(i))
  const valProbDer = calcOrNull(pInput, (i) => W.valorDadaProbabilidadDerecha.calcular(i))

  const promDosColas = calcOrNull(abInput, (i) => W.promedioTruncadoDosColas.calcular(i))

  function formulaValoresX(
    calculo: (typeof W)["probabilidadAcumuladaIzquierda"],
    resultado: number | null
  ) {
    if (resultado === null || xInput === null) return undefined
    return calculo.formulaConValores(xInput, resultado)
  }

  function formulaValoresP(
    calculo: (typeof W)["valorDadaProbabilidadIzquierda"],
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
          <h1 className="text-2xl font-semibold tracking-tight">Weibull</h1>
          <p className="mt-1 text-sm text-muted-foreground">{W.descripcion}</p>
        </div>

        <ParametrosPanel spec={W} onParamsChange={handleParamsChange} />

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
                placeholder="x ≥ 0"
                min={0}
                value={xStr}
                onChange={(e) => setXStr(e.target.value)}
                className="h-8 max-w-40 text-sm"
              />
              {x !== null && !isNaN(x) && x < 0 && (
                <span className="text-xs text-destructive">x debe ser ≥ 0</span>
              )}
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={W.probabilidadAcumuladaIzquierda.titulo}
                valor={probIzq}
                esProbabilidad
                formulaInfo={{
                  titulo: W.probabilidadAcumuladaIzquierda.titulo,
                  descripcionTeorica: W.probabilidadAcumuladaIzquierda.descripcionTeorica,
                  formulaGeneral: W.probabilidadAcumuladaIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresX(W.probabilidadAcumuladaIzquierda, probIzq),
                }}
              />
              <ResultadoFila
                titulo={W.probabilidadAcumuladaDerecha.titulo}
                valor={probDer}
                esProbabilidad
                formulaInfo={{
                  titulo: W.probabilidadAcumuladaDerecha.titulo,
                  descripcionTeorica: W.probabilidadAcumuladaDerecha.descripcionTeorica,
                  formulaGeneral: W.probabilidadAcumuladaDerecha.formulaGeneral,
                  formulaConValores: formulaValoresX(W.probabilidadAcumuladaDerecha, probDer),
                }}
              />
            </div>

            <Separator />

            {params && (
              <>
                <div className="divide-y divide-border/60">
                  {(() => {
                    const mo = modaWeibull(params)
                    return (
                      <ResultadoFila
                        titulo={params.omega <= 1 ? "Moda \n Mo = 0 (ω ≤ 1)" : "Moda \n Mo"}
                        valor={mo}
                        formulaInfo={{
                          titulo: "Moda",
                          descripcionTeorica:
                            "La moda depende del parámetro de forma ω. " +
                            "Si ω ≤ 1, la PDF es decreciente y la moda es 0. " +
                            "Si ω > 1, la moda se desplaza hacia β·(1−1/ω)^(1/ω).",
                          formulaGeneral:
                            "Mo = \\begin{cases} 0 & \\omega \\leq 1 \\\\ \\beta \\cdot \\left(1 - \\frac{1}{\\omega}\\right)^{\\frac{1}{\\omega}} & \\omega > 1 \\end{cases}",
                          formulaConValores:
                            params.omega <= 1
                              ? `Mo = 0 \\quad (\\omega = ${numeroLatex(params.omega)} \\leq 1)`
                              : `Mo = ${numeroLatex(params.beta)} \\cdot \\left(1 - \\frac{1}{${numeroLatex(params.omega)}}\\right)^{\\frac{1}{${numeroLatex(params.omega)}}} = ${numeroLatex(mo)}`,
                        }}
                      />
                    )
                  })()}
                  {W.esperanza && (() => {
                    const esp = W.esperanza.calcular(params)
                    return (
                      <ResultadoFila
                        titulo={W.esperanza.titulo}
                        valor={esp}
                        formulaInfo={{
                          titulo: W.esperanza.titulo,
                          descripcionTeorica: W.esperanza.descripcionTeorica,
                          formulaGeneral: W.esperanza.formulaGeneral,
                          formulaConValores: W.esperanza.formulaConValores(params, esp),
                        }}
                      />
                    )
                  })()}
                  {W.desvio && (() => {
                    const dev = W.desvio.calcular(params)
                    return (
                      <ResultadoFila
                        titulo={W.desvio.titulo}
                        valor={dev}
                        formulaInfo={{
                          titulo: W.desvio.titulo,
                          descripcionTeorica: W.desvio.descripcionTeorica,
                          formulaGeneral: W.desvio.formulaGeneral,
                          formulaConValores: W.desvio.formulaConValores(params, dev),
                        }}
                      />
                    )
                  })()}
                </div>
                <Separator />
              </>
            )}

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={W.expectativaParcialIzquierda.titulo}
                valor={expIzq}
                formulaInfo={{
                  titulo: W.expectativaParcialIzquierda.titulo,
                  descripcionTeorica: W.expectativaParcialIzquierda.descripcionTeorica,
                  formulaGeneral: W.expectativaParcialIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresX(W.expectativaParcialIzquierda, expIzq),
                }}
              />
              <ResultadoFila
                titulo={W.expectativaParcialDerecha.titulo}
                valor={expDer}
                formulaInfo={{
                  titulo: W.expectativaParcialDerecha.titulo,
                  descripcionTeorica: W.expectativaParcialDerecha.descripcionTeorica,
                  formulaGeneral: W.expectativaParcialDerecha.formulaGeneral,
                  formulaConValores: formulaValoresX(W.expectativaParcialDerecha, expDer),
                }}
              />
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={W.promedioTruncadoIzquierdo.titulo}
                valor={promIzq}
                formulaInfo={{
                  titulo: W.promedioTruncadoIzquierdo.titulo,
                  descripcionTeorica: W.promedioTruncadoIzquierdo.descripcionTeorica,
                  formulaGeneral: W.promedioTruncadoIzquierdo.formulaGeneral,
                  formulaConValores: formulaValoresX(W.promedioTruncadoIzquierdo, promIzq),
                }}
              />
              <ResultadoFila
                titulo={W.promedioTruncadoDerecho.titulo}
                valor={promDer}
                formulaInfo={{
                  titulo: W.promedioTruncadoDerecho.titulo,
                  descripcionTeorica: W.promedioTruncadoDerecho.descripcionTeorica,
                  formulaGeneral: W.promedioTruncadoDerecho.formulaGeneral,
                  formulaConValores: formulaValoresX(W.promedioTruncadoDerecho, promDer),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Sección 2: dada una probabilidad ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Dado una probabilidad
            </CardTitle>
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
                titulo={W.valorDadaProbabilidadIzquierda.titulo}
                valor={valProbIzq}
                formulaInfo={{
                  titulo: W.valorDadaProbabilidadIzquierda.titulo,
                  descripcionTeorica: W.valorDadaProbabilidadIzquierda.descripcionTeorica,
                  formulaGeneral: W.valorDadaProbabilidadIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresP(W.valorDadaProbabilidadIzquierda, valProbIzq),
                }}
              />
              <ResultadoFila
                titulo={W.valorDadaProbabilidadDerecha.titulo}
                valor={valProbDer}
                formulaInfo={{
                  titulo: W.valorDadaProbabilidadDerecha.titulo,
                  descripcionTeorica: W.valorDadaProbabilidadDerecha.descripcionTeorica,
                  formulaGeneral: W.valorDadaProbabilidadDerecha.formulaGeneral,
                  formulaConValores: formulaValoresP(W.valorDadaProbabilidadDerecha, valProbDer),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Sección 3: promedio truncado a dos colas ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Promedio truncado a dos colas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            <div className="flex flex-wrap items-center gap-3 pb-3">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="sec3-a"
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  P (
                </Label>
                <Input
                  id="sec3-a"
                  type="number"
                  placeholder="x₁"
                  min={0}
                  value={aStr}
                  onChange={(e) => setAStr(e.target.value)}
                  className="h-8 w-28 text-sm"
                />
                <Label>≤ X ≤</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  id="sec3-b"
                  type="number"
                  placeholder="x₂"
                  value={bStr}
                  onChange={(e) => setBStr(e.target.value)}
                  className="h-8 w-28 text-sm"
                />
                <Label
                  htmlFor="sec3-b"
                  className="w-8 shrink-0 text-xs text-muted-foreground"
                >
                  )
                </Label>
              </div>
              {a !== null &&
                bLim !== null &&
                !isNaN(a) &&
                !isNaN(bLim) &&
                a >= bLim && (
                  <span className="text-xs text-destructive">
                    x₁ debe ser menor que x₂
                  </span>
                )}
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              {W.probabilidadIntervalo &&
                (() => {
                  const probInt = calcOrNull(abInput, (i) =>
                    W.probabilidadIntervalo!.calcular(i)
                  )
                  return (
                    <ResultadoFila
                      titulo={W.probabilidadIntervalo.titulo}
                      valor={probInt}
                      esProbabilidad
                      formulaInfo={{
                        titulo: W.probabilidadIntervalo.titulo,
                        descripcionTeorica: W.probabilidadIntervalo.descripcionTeorica,
                        formulaGeneral: W.probabilidadIntervalo.formulaGeneral,
                        formulaConValores:
                          probInt !== null && abInput !== null
                            ? W.probabilidadIntervalo.formulaConValores(abInput, probInt)
                            : undefined,
                      }}
                    />
                  )
                })()}
              <ResultadoFila
                titulo={W.promedioTruncadoDosColas.titulo}
                valor={promDosColas}
                formulaInfo={{
                  titulo: W.promedioTruncadoDosColas.titulo,
                  descripcionTeorica: W.promedioTruncadoDosColas.descripcionTeorica,
                  formulaGeneral: W.promedioTruncadoDosColas.formulaGeneral,
                  formulaConValores:
                    promDosColas !== null && abInput !== null
                      ? W.promedioTruncadoDosColas.formulaConValores(abInput, promDosColas)
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
              {x !== null && !isNaN(x) && x >= 0 && (
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
                    P(X ≥ x)
                  </Button>
                </div>
              )}
              <WeibullChart params={params} x={x} modo={modo} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
