import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DistribucionExponencial, type ParamsExponencial } from "@/lib/distribuciones"
import { numeroLatex } from "@/lib/distribuciones/formato"

import { ExponencialChart } from "./exponencial-chart"
import { ParametrosPanel } from "./parametros-panel"
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

export function ExponencialDistributionPage() {
  const [params, setParams] = useState<ParamsExponencial | null>(null)
  const [modo, setModo] = useState<"izq" | "der">("izq")

  const [xStr, setXStr] = useState("")
  const [pStr, setPStr] = useState("")
  const [aStr, setAStr] = useState("")
  const [bStr, setBStr] = useState("")

  const handleParamsChange = useCallback(
    (p: ParamsExponencial | null) => setParams(p),
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

  const E = DistribucionExponencial

  const probIzq = calcOrNull(xInput, (i) => E.probabilidadAcumuladaIzquierda.calcular(i))
  const probDer = calcOrNull(xInput, (i) => E.probabilidadAcumuladaDerecha.calcular(i))
  const expIzq = calcOrNull(xInput, (i) => E.expectativaParcialIzquierda.calcular(i))
  const expDer = calcOrNull(xInput, (i) => E.expectativaParcialDerecha.calcular(i))
  const promIzq = calcOrNull(xInput, (i) => E.promedioTruncadoIzquierdo.calcular(i))
  const promDer = calcOrNull(xInput, (i) => E.promedioTruncadoDerecho.calcular(i))

  const valProbIzq = calcOrNull(pInput, (i) => E.valorDadaProbabilidadIzquierda.calcular(i))
  const valProbDer = calcOrNull(pInput, (i) => E.valorDadaProbabilidadDerecha.calcular(i))

  const promDosColas = calcOrNull(abInput, (i) => E.promedioTruncadoDosColas.calcular(i))

  function formulaValoresX(
    calculo: (typeof E)["probabilidadAcumuladaIzquierda"],
    resultado: number | null
  ) {
    if (resultado === null || xInput === null) return undefined
    return calculo.formulaConValores(xInput, resultado)
  }

  function formulaValoresP(
    calculo: (typeof E)["valorDadaProbabilidadIzquierda"],
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
          <h1 className="text-2xl font-semibold tracking-tight">Exponencial</h1>
          <p className="mt-1 text-sm text-muted-foreground">{E.descripcion}</p>
        </div>

        <ParametrosPanel spec={E} onParamsChange={handleParamsChange} />

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
                titulo={E.probabilidadAcumuladaIzquierda.titulo}
                valor={probIzq}
                esProbabilidad
                formulaInfo={{
                  titulo: E.probabilidadAcumuladaIzquierda.titulo,
                  descripcionTeorica: E.probabilidadAcumuladaIzquierda.descripcionTeorica,
                  formulaGeneral: E.probabilidadAcumuladaIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresX(E.probabilidadAcumuladaIzquierda, probIzq),
                }}
              />
              <ResultadoFila
                titulo={E.probabilidadAcumuladaDerecha.titulo}
                valor={probDer}
                esProbabilidad
                formulaInfo={{
                  titulo: E.probabilidadAcumuladaDerecha.titulo,
                  descripcionTeorica: E.probabilidadAcumuladaDerecha.descripcionTeorica,
                  formulaGeneral: E.probabilidadAcumuladaDerecha.formulaGeneral,
                  formulaConValores: formulaValoresX(E.probabilidadAcumuladaDerecha, probDer),
                }}
              />
            </div>

            <Separator />

            {params && (
              <>
                <div className="divide-y divide-border/60">
                  <ResultadoFila
                    titulo="Moda \n Mo = 0"
                    valor={0}
                    formulaInfo={{
                      titulo: "Moda",
                      descripcionTeorica:
                        "Para la distribución exponencial, la moda es siempre 0 ya que la densidad de probabilidad es máxima en el origen del dominio (la PDF es decreciente para todo x ≥ 0).",
                      formulaGeneral: "Mo = 0",
                      formulaConValores: `Mo = 0`,
                    }}
                  />
                  {E.esperanza && (() => {
                    const esp = E.esperanza.calcular(params)
                    return (
                      <ResultadoFila
                        titulo={E.esperanza.titulo}
                        valor={esp}
                        formulaInfo={{
                          titulo: E.esperanza.titulo,
                          descripcionTeorica: E.esperanza.descripcionTeorica,
                          formulaGeneral: E.esperanza.formulaGeneral,
                          formulaConValores: E.esperanza.formulaConValores(params, esp),
                        }}
                      />
                    )
                  })()}
                  {E.desvio && (() => {
                    const dev = E.desvio.calcular(params)
                    return (
                      <ResultadoFila
                        titulo={E.desvio.titulo}
                        valor={dev}
                        formulaInfo={{
                          titulo: E.desvio.titulo,
                          descripcionTeorica: E.desvio.descripcionTeorica,
                          formulaGeneral: E.desvio.formulaGeneral,
                          formulaConValores: E.desvio.formulaConValores(params, dev),
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
                titulo={E.expectativaParcialIzquierda.titulo}
                valor={expIzq}
                formulaInfo={{
                  titulo: E.expectativaParcialIzquierda.titulo,
                  descripcionTeorica: E.expectativaParcialIzquierda.descripcionTeorica,
                  formulaGeneral: E.expectativaParcialIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresX(E.expectativaParcialIzquierda, expIzq),
                }}
              />
              <ResultadoFila
                titulo={E.expectativaParcialDerecha.titulo}
                valor={expDer}
                formulaInfo={{
                  titulo: E.expectativaParcialDerecha.titulo,
                  descripcionTeorica: E.expectativaParcialDerecha.descripcionTeorica,
                  formulaGeneral: E.expectativaParcialDerecha.formulaGeneral,
                  formulaConValores: formulaValoresX(E.expectativaParcialDerecha, expDer),
                }}
              />
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={E.promedioTruncadoIzquierdo.titulo}
                valor={promIzq}
                formulaInfo={{
                  titulo: E.promedioTruncadoIzquierdo.titulo,
                  descripcionTeorica: E.promedioTruncadoIzquierdo.descripcionTeorica,
                  formulaGeneral: E.promedioTruncadoIzquierdo.formulaGeneral,
                  formulaConValores: formulaValoresX(E.promedioTruncadoIzquierdo, promIzq),
                }}
              />
              <ResultadoFila
                titulo={E.promedioTruncadoDerecho.titulo}
                valor={promDer}
                formulaInfo={{
                  titulo: E.promedioTruncadoDerecho.titulo,
                  descripcionTeorica: E.promedioTruncadoDerecho.descripcionTeorica,
                  formulaGeneral: E.promedioTruncadoDerecho.formulaGeneral,
                  formulaConValores: formulaValoresX(E.promedioTruncadoDerecho, promDer),
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
                titulo={E.valorDadaProbabilidadIzquierda.titulo}
                valor={valProbIzq}
                formulaInfo={{
                  titulo: E.valorDadaProbabilidadIzquierda.titulo,
                  descripcionTeorica: E.valorDadaProbabilidadIzquierda.descripcionTeorica,
                  formulaGeneral: E.valorDadaProbabilidadIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresP(E.valorDadaProbabilidadIzquierda, valProbIzq),
                }}
              />
              <ResultadoFila
                titulo={E.valorDadaProbabilidadDerecha.titulo}
                valor={valProbDer}
                formulaInfo={{
                  titulo: E.valorDadaProbabilidadDerecha.titulo,
                  descripcionTeorica: E.valorDadaProbabilidadDerecha.descripcionTeorica,
                  formulaGeneral: E.valorDadaProbabilidadDerecha.formulaGeneral,
                  formulaConValores: formulaValoresP(E.valorDadaProbabilidadDerecha, valProbDer),
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
              {E.probabilidadIntervalo &&
                (() => {
                  const probInt = calcOrNull(abInput, (i) =>
                    E.probabilidadIntervalo!.calcular(i)
                  )
                  return (
                    <ResultadoFila
                      titulo={E.probabilidadIntervalo.titulo}
                      valor={probInt}
                      esProbabilidad
                      formulaInfo={{
                        titulo: E.probabilidadIntervalo.titulo,
                        descripcionTeorica: E.probabilidadIntervalo.descripcionTeorica,
                        formulaGeneral: E.probabilidadIntervalo.formulaGeneral,
                        formulaConValores:
                          probInt !== null && abInput !== null
                            ? E.probabilidadIntervalo.formulaConValores(abInput, probInt)
                            : undefined,
                      }}
                    />
                  )
                })()}
              <ResultadoFila
                titulo={E.promedioTruncadoDosColas.titulo}
                valor={promDosColas}
                formulaInfo={{
                  titulo: E.promedioTruncadoDosColas.titulo,
                  descripcionTeorica: E.promedioTruncadoDosColas.descripcionTeorica,
                  formulaGeneral: E.promedioTruncadoDosColas.formulaGeneral,
                  formulaConValores:
                    promDosColas !== null && abInput !== null
                      ? E.promedioTruncadoDosColas.formulaConValores(abInput, promDosColas)
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
              <ExponencialChart params={params} x={x} modo={modo} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
