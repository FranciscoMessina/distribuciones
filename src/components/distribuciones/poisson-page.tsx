import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DistribucionPoisson, type ParamsPoisson } from "@/lib/distribuciones"

import { ParametrosPanel } from "./parametros-panel"
import { PoissonChart } from "./poisson-chart"
import { ResultadoFila } from "./resultado-fila"

function calcOrNull<T>(input: T | null, fn: (i: T) => number): number | null {
  if (input === null) return null
  try {
    const result = fn(input)
    return isFinite(result) ? result : null
  } catch {
    return null
  }
}

export function PoissonDistributionPage() {
  const [params, setParams] = useState<ParamsPoisson | null>(null)
  const [modo, setModo] = useState<"izq" | "der">("izq")

  const [rStr, setRStr] = useState("")
  const [pStr, setPStr] = useState("")
  const [aStr, setAStr] = useState("")
  const [bStr, setBStr] = useState("")

  const handleParamsChange = useCallback(
    (p: ParamsPoisson | null) => setParams(p),
    []
  )

  const rRaw = rStr !== "" ? parseFloat(rStr) : null
  const r = rRaw !== null && !isNaN(rRaw) && rRaw >= 0 ? Math.floor(rRaw) : null
  const p = pStr !== "" ? parseFloat(pStr) : null
  const aRaw = aStr !== "" ? parseFloat(aStr) : null
  const bRaw = bStr !== "" ? parseFloat(bStr) : null
  const a = aRaw !== null && !isNaN(aRaw) && aRaw >= 0 ? Math.floor(aRaw) : null
  const bLim = bRaw !== null && !isNaN(bRaw) ? Math.floor(bRaw) : null

  const rInput = r !== null && params ? { params, x: r } : null
  const pInput =
    p !== null && !isNaN(p) && p > 0 && p < 1 && params ? { params, p } : null
  const abInput =
    a !== null && bLim !== null && a >= 0 && a < bLim && params
      ? { params, a, b: bLim }
      : null

  const P = DistribucionPoisson

  const probIzq = calcOrNull(rInput, (i) => P.probabilidadAcumuladaIzquierda.calcular(i))
  const probDer = calcOrNull(rInput, (i) => P.probabilidadAcumuladaDerecha.calcular(i))
  const expIzq = calcOrNull(rInput, (i) => P.expectativaParcialIzquierda.calcular(i))
  const expDer = calcOrNull(rInput, (i) => P.expectativaParcialDerecha.calcular(i))
  const promIzq = calcOrNull(rInput, (i) => P.promedioTruncadoIzquierdo.calcular(i))
  const promDer = calcOrNull(rInput, (i) => P.promedioTruncadoDerecho.calcular(i))
  const valProbIzq = calcOrNull(pInput, (i) => P.valorDadaProbabilidadIzquierda.calcular(i))
  const valProbDer = calcOrNull(pInput, (i) => P.valorDadaProbabilidadDerecha.calcular(i))
  const promDosColas = calcOrNull(abInput, (i) => P.promedioTruncadoDosColas.calcular(i))

  function formulaValoresR(
    calculo: (typeof P)["probabilidadAcumuladaIzquierda"],
    resultado: number | null
  ) {
    if (resultado === null || rInput === null) return undefined
    return calculo.formulaConValores(rInput, resultado)
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
          <h1 className="text-2xl font-semibold tracking-tight">Poisson</h1>
          <p className="mt-1 text-sm text-muted-foreground">{P.descripcion}</p>
        </div>

        <ParametrosPanel spec={P} onParamsChange={handleParamsChange} />

        {/* ── Sección 1: dado un valor r ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dado un valor</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            <div className="items-left flex flex-col gap-3 pb-3">
              <Label
                htmlFor="sec1-r"
                className="w-16 shrink-0 text-xs text-muted-foreground"
              >
                Valor de r
              </Label>
              <Input
                id="sec1-r"
                type="number"
                placeholder="r ≥ 0 (entero)"
                min={0}
                step={1}
                value={rStr}
                onChange={(e) => setRStr(e.target.value)}
                className="h-8 max-w-40 text-sm"
              />
              {rRaw !== null && !isNaN(rRaw) && rRaw < 0 && (
                <span className="text-xs text-destructive">r debe ser ≥ 0</span>
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
                  descripcionTeorica: P.probabilidadAcumuladaIzquierda.descripcionTeorica,
                  formulaGeneral: P.probabilidadAcumuladaIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresR(P.probabilidadAcumuladaIzquierda, probIzq),
                }}
              />
              <ResultadoFila
                titulo={P.probabilidadAcumuladaDerecha.titulo}
                valor={probDer}
                esProbabilidad
                formulaInfo={{
                  titulo: P.probabilidadAcumuladaDerecha.titulo,
                  descripcionTeorica: P.probabilidadAcumuladaDerecha.descripcionTeorica,
                  formulaGeneral: P.probabilidadAcumuladaDerecha.formulaGeneral,
                  formulaConValores: formulaValoresR(P.probabilidadAcumuladaDerecha, probDer),
                }}
              />
            </div>

            <Separator />

            {params && (
              <>
                <div className="divide-y divide-border/60">
                  {P.esperanza &&
                    (() => {
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
                  {P.desvio &&
                    (() => {
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
                  descripcionTeorica: P.expectativaParcialIzquierda.descripcionTeorica,
                  formulaGeneral: P.expectativaParcialIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresR(P.expectativaParcialIzquierda, expIzq),
                }}
              />
              <ResultadoFila
                titulo={P.expectativaParcialDerecha.titulo}
                valor={expDer}
                formulaInfo={{
                  titulo: P.expectativaParcialDerecha.titulo,
                  descripcionTeorica: P.expectativaParcialDerecha.descripcionTeorica,
                  formulaGeneral: P.expectativaParcialDerecha.formulaGeneral,
                  formulaConValores: formulaValoresR(P.expectativaParcialDerecha, expDer),
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
                  descripcionTeorica: P.promedioTruncadoIzquierdo.descripcionTeorica,
                  formulaGeneral: P.promedioTruncadoIzquierdo.formulaGeneral,
                  formulaConValores: formulaValoresR(P.promedioTruncadoIzquierdo, promIzq),
                }}
              />
              <ResultadoFila
                titulo={P.promedioTruncadoDerecho.titulo}
                valor={promDer}
                formulaInfo={{
                  titulo: P.promedioTruncadoDerecho.titulo,
                  descripcionTeorica: P.promedioTruncadoDerecho.descripcionTeorica,
                  formulaGeneral: P.promedioTruncadoDerecho.formulaGeneral,
                  formulaConValores: formulaValoresR(P.promedioTruncadoDerecho, promDer),
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
                titulo={P.valorDadaProbabilidadIzquierda.titulo}
                valor={valProbIzq}
                formulaInfo={{
                  titulo: P.valorDadaProbabilidadIzquierda.titulo,
                  descripcionTeorica: P.valorDadaProbabilidadIzquierda.descripcionTeorica,
                  formulaGeneral: P.valorDadaProbabilidadIzquierda.formulaGeneral,
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
                  descripcionTeorica: P.valorDadaProbabilidadDerecha.descripcionTeorica,
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
                  placeholder="r₁"
                  min={0}
                  step={1}
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
                  placeholder="r₂"
                  step={1}
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
                    r₁ debe ser menor que r₂
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
                        descripcionTeorica: P.probabilidadIntervalo.descripcionTeorica,
                        formulaGeneral: P.probabilidadIntervalo.formulaGeneral,
                        formulaConValores:
                          probInt !== null && abInput !== null
                            ? P.probabilidadIntervalo.formulaConValores(abInput, probInt)
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
                  descripcionTeorica: P.promedioTruncadoDosColas.descripcionTeorica,
                  formulaGeneral: P.promedioTruncadoDosColas.formulaGeneral,
                  formulaConValores:
                    promDosColas !== null && abInput !== null
                      ? P.promedioTruncadoDosColas.formulaConValores(abInput, promDosColas)
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
              {r !== null && (
                <div className="mb-2 flex justify-center gap-1">
                  <Button
                    size="xs"
                    variant={modo === "izq" ? "default" : "ghost"}
                    onClick={() => setModo("izq")}
                  >
                    P(X ≤ r)
                  </Button>
                  <Button
                    size="xs"
                    variant={modo === "der" ? "default" : "ghost"}
                    onClick={() => setModo("der")}
                  >
                    P(X ≥ r)
                  </Button>
                </div>
              )}
              <PoissonChart params={params} r={r} modo={modo} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
