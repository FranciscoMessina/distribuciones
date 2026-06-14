import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DistribucionPareto, type ParamsPareto } from "@/lib/distribuciones"
import { numeroLatex } from "@/lib/distribuciones/formato"
import { medianaPareto, modaPareto } from "@/lib/distribuciones/pareto"

import { ParametrosPanel } from "./parametros-panel"
import { ParetoChart } from "./pareto-chart"
import { ResultadoFila } from "./resultado-fila"

function calcOrNull<T>(input: T | null, fn: (i: T) => number): number | null {
  if (input === null) return null
  try {
    return fn(input)
  } catch {
    return null
  }
}

export function ParetoDistributionPage() {
  const [params, setParams] = useState<ParamsPareto | null>(null)
  const [modo, setModo] = useState<"izq" | "der">("izq")

  const [xStr, setXStr] = useState("")
  const [pStr, setPStr] = useState("")
  const [aStr, setAStr] = useState("")
  const [bStr, setBStr] = useState("")

  const handleParamsChange = useCallback(
    (p: ParamsPareto | null) => setParams(p),
    []
  )

  const x = xStr !== "" ? parseFloat(xStr) : null
  const p = pStr !== "" ? parseFloat(pStr) : null
  const a = aStr !== "" ? parseFloat(aStr) : null
  const bLim = bStr !== "" ? parseFloat(bStr) : null

  const theta = params?.theta ?? 0

  const xInput =
    x !== null && !isNaN(x) && x >= theta && params ? { params, x } : null
  const pInput =
    p !== null && !isNaN(p) && p > 0 && p < 1 && params ? { params, p } : null
  const abInput =
    a !== null &&
    bLim !== null &&
    !isNaN(a) &&
    !isNaN(bLim) &&
    a < bLim &&
    params
      ? { params, a, b: bLim }
      : null

  const P = DistribucionPareto

  const probIzq = calcOrNull(xInput, (i) =>
    P.probabilidadAcumuladaIzquierda.calcular(i)
  )
  const probDer = calcOrNull(xInput, (i) =>
    P.probabilidadAcumuladaDerecha.calcular(i)
  )
  const expIzq = calcOrNull(xInput, (i) =>
    P.expectativaParcialIzquierda.calcular(i)
  )
  const expDer = calcOrNull(xInput, (i) =>
    P.expectativaParcialDerecha.calcular(i)
  )
  const promIzq = calcOrNull(xInput, (i) =>
    P.promedioTruncadoIzquierdo.calcular(i)
  )
  const promDer = calcOrNull(xInput, (i) =>
    P.promedioTruncadoDerecho.calcular(i)
  )

  const valProbIzq = calcOrNull(pInput, (i) =>
    P.valorDadaProbabilidadIzquierda.calcular(i)
  )
  const valProbDer = calcOrNull(pInput, (i) =>
    P.valorDadaProbabilidadDerecha.calcular(i)
  )

  const promDosColas = calcOrNull(abInput, (i) =>
    P.promedioTruncadoDosColas.calcular(i)
  )

  function formulaValoresX(
    calculo: (typeof P)["probabilidadAcumuladaIzquierda"],
    resultado: number | null
  ) {
    if (resultado === null || xInput === null) return undefined
    return calculo.formulaConValores(xInput, resultado)
  }

  function formulaValoresP(
    calculo: (typeof P)["valorDadaProbabilidadIzquierda"],
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
          <h1 className="text-2xl font-semibold tracking-tight">Pareto</h1>
          <p className="mt-1 text-sm text-muted-foreground">{P.descripcion}</p>
        </div>

        <ParametrosPanel spec={P} onParamsChange={handleParamsChange} />

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
                placeholder={`x ≥ θ${params ? ` = ${params.theta}` : ""}`}
                min={theta}
                value={xStr}
                onChange={(e) => setXStr(e.target.value)}
                className="h-8 max-w-40 text-sm"
              />
              {x !== null && !isNaN(x) && x < theta && (
                <span className="text-xs text-destructive">
                  x debe ser mayor o igual a θ = {theta}
                </span>
              )}
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={P.probabilidadAcumuladaIzquierda.titulo}
                valor={probIzq}
                esProbabilidad
                formulaInfo={{
                  titulo: P.probabilidadAcumuladaIzquierda.titulo,
                  descripcionTeorica:
                    P.probabilidadAcumuladaIzquierda.descripcionTeorica,
                  formulaGeneral:
                    P.probabilidadAcumuladaIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    P.probabilidadAcumuladaIzquierda,
                    probIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={P.probabilidadAcumuladaDerecha.titulo}
                valor={probDer}
                esProbabilidad
                formulaInfo={{
                  titulo: P.probabilidadAcumuladaDerecha.titulo,
                  descripcionTeorica:
                    P.probabilidadAcumuladaDerecha.descripcionTeorica,
                  formulaGeneral: P.probabilidadAcumuladaDerecha.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    P.probabilidadAcumuladaDerecha,
                    probDer
                  ),
                }}
              />
            </div>

            <Separator />

            {params && (
              <>
                <div className="divide-y divide-border/60">
                  {(() => {
                    const mo = modaPareto(params)
                    return (
                      <ResultadoFila
                        titulo={"Moda \n Mo = θ"}
                        valor={mo}
                        formulaInfo={{
                          titulo: "Moda",
                          descripcionTeorica:
                            "La moda de la distribución Pareto coincide con su parámetro mínimo θ, " +
                            "ya que la PDF es estrictamente decreciente para x ≥ θ.",
                          formulaGeneral: "Mo = \\theta",
                          formulaConValores: `Mo = ${numeroLatex(mo)}`,
                        }}
                      />
                    )
                  })()}
                  {(() => {
                    const me = medianaPareto(params)
                    return (
                      <ResultadoFila
                        titulo={"Mediana \n Me = θ · 2^(1/b)"}
                        valor={me}
                        formulaInfo={{
                          titulo: "Mediana",
                          descripcionTeorica:
                            "La mediana es el fractil al 50%: P(X ≤ Me) = 0.5. " +
                            "Invirtiendo G_p(Me) = 0.5 se obtiene Me = θ · 2^(1/b).",
                          formulaGeneral: "Me = \\theta \\cdot 2^{1/b}",
                          formulaConValores: `Me = ${numeroLatex(params.theta)} \\cdot 2^{1/${numeroLatex(params.b)}} = ${numeroLatex(me)}`,
                        }}
                      />
                    )
                  })()}
                  {P.esperanza && (() => {
                    const esp = P.esperanza.calcular(params)
                    return (
                      <ResultadoFila
                        titulo={P.esperanza.titulo}
                        valor={esp}
                        formulaInfo={{
                          titulo: P.esperanza.titulo,
                          descripcionTeorica: P.esperanza.descripcionTeorica,
                          formulaGeneral: P.esperanza.formulaGeneral,
                          formulaConValores: P.esperanza.formulaConValores(params, esp),
                        }}
                      />
                    )
                  })()}
                  {P.desvio && (() => {
                    const dev = P.desvio.calcular(params)
                    return (
                      <ResultadoFila
                        titulo={P.desvio.titulo}
                        valor={dev}
                        formulaInfo={{
                          titulo: P.desvio.titulo,
                          descripcionTeorica: P.desvio.descripcionTeorica,
                          formulaGeneral: P.desvio.formulaGeneral,
                          formulaConValores: P.desvio.formulaConValores(params, dev),
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
                titulo={P.expectativaParcialIzquierda.titulo}
                valor={expIzq}
                formulaInfo={{
                  titulo: P.expectativaParcialIzquierda.titulo,
                  descripcionTeorica:
                    P.expectativaParcialIzquierda.descripcionTeorica,
                  formulaGeneral: P.expectativaParcialIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    P.expectativaParcialIzquierda,
                    expIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={P.expectativaParcialDerecha.titulo}
                valor={expDer}
                formulaInfo={{
                  titulo: P.expectativaParcialDerecha.titulo,
                  descripcionTeorica:
                    P.expectativaParcialDerecha.descripcionTeorica,
                  formulaGeneral: P.expectativaParcialDerecha.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    P.expectativaParcialDerecha,
                    expDer
                  ),
                }}
              />
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={P.promedioTruncadoIzquierdo.titulo}
                valor={promIzq}
                formulaInfo={{
                  titulo: P.promedioTruncadoIzquierdo.titulo,
                  descripcionTeorica:
                    P.promedioTruncadoIzquierdo.descripcionTeorica,
                  formulaGeneral: P.promedioTruncadoIzquierdo.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    P.promedioTruncadoIzquierdo,
                    promIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={P.promedioTruncadoDerecho.titulo}
                valor={promDer}
                formulaInfo={{
                  titulo: P.promedioTruncadoDerecho.titulo,
                  descripcionTeorica:
                    P.promedioTruncadoDerecho.descripcionTeorica,
                  formulaGeneral: P.promedioTruncadoDerecho.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    P.promedioTruncadoDerecho,
                    promDer
                  ),
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Sección 2: dada una probabilidad p ── */}
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
                titulo={P.valorDadaProbabilidadIzquierda.titulo}
                valor={valProbIzq}
                formulaInfo={{
                  titulo: P.valorDadaProbabilidadIzquierda.titulo,
                  descripcionTeorica:
                    P.valorDadaProbabilidadIzquierda.descripcionTeorica,
                  formulaGeneral:
                    P.valorDadaProbabilidadIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresP(
                    P.valorDadaProbabilidadIzquierda,
                    valProbIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={P.valorDadaProbabilidadDerecha.titulo}
                valor={valProbDer}
                formulaInfo={{
                  titulo: P.valorDadaProbabilidadDerecha.titulo,
                  descripcionTeorica:
                    P.valorDadaProbabilidadDerecha.descripcionTeorica,
                  formulaGeneral: P.valorDadaProbabilidadDerecha.formulaGeneral,
                  formulaConValores: formulaValoresP(
                    P.valorDadaProbabilidadDerecha,
                    valProbDer
                  ),
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
              {P.probabilidadIntervalo &&
                (() => {
                  const probInt = calcOrNull(abInput, (i) =>
                    P.probabilidadIntervalo!.calcular(i)
                  )
                  return (
                    <ResultadoFila
                      titulo={P.probabilidadIntervalo.titulo}
                      valor={probInt}
                      esProbabilidad
                      formulaInfo={{
                        titulo: P.probabilidadIntervalo.titulo,
                        descripcionTeorica:
                          P.probabilidadIntervalo.descripcionTeorica,
                        formulaGeneral: P.probabilidadIntervalo.formulaGeneral,
                        formulaConValores:
                          probInt !== null && abInput !== null
                            ? P.probabilidadIntervalo.formulaConValores(
                                abInput,
                                probInt
                              )
                            : undefined,
                      }}
                    />
                  )
                })()}
              <ResultadoFila
                titulo={P.promedioTruncadoDosColas.titulo}
                valor={promDosColas}
                formulaInfo={{
                  titulo: P.promedioTruncadoDosColas.titulo,
                  descripcionTeorica:
                    P.promedioTruncadoDosColas.descripcionTeorica,
                  formulaGeneral: P.promedioTruncadoDosColas.formulaGeneral,
                  formulaConValores:
                    promDosColas !== null && abInput !== null
                      ? P.promedioTruncadoDosColas.formulaConValores(
                          abInput,
                          promDosColas
                        )
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
              {x !== null && !isNaN(x) && x >= theta && (
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
              <ParetoChart params={params} x={x} modo={modo} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
