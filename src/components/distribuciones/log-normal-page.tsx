import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  DistribucionLogNormal,
  type ParamsLogNormal,
} from "@/lib/distribuciones"

import { LogNormalChart } from "./log-normal-chart"
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

export function LogNormalDistributionPage() {
  const [params, setParams] = useState<ParamsLogNormal | null>(null)
  const [modo, setModo] = useState<"izq" | "der">("izq")

  const [xStr, setXStr] = useState("")
  const [pStr, setPStr] = useState("")
  const [aStr, setAStr] = useState("")
  const [bStr, setBStr] = useState("")

  const handleParamsChange = useCallback(
    (p: ParamsLogNormal | null) => setParams(p),
    []
  )

  const x = xStr !== "" ? parseFloat(xStr) : null
  const p = pStr !== "" ? parseFloat(pStr) : null
  const a = aStr !== "" ? parseFloat(aStr) : null
  const b = bStr !== "" ? parseFloat(bStr) : null

  const xInput =
    x !== null && !isNaN(x) && x > 0 && params ? { params, x } : null
  const pInput =
    p !== null && !isNaN(p) && p > 0 && p < 1 && params ? { params, p } : null
  const abInput =
    a !== null && b !== null && !isNaN(a) && !isNaN(b) && a < b && params
      ? { params, a, b }
      : null

  const LN = DistribucionLogNormal

  const probIzq = calcOrNull(xInput, (i) =>
    LN.probabilidadAcumuladaIzquierda.calcular(i)
  )
  const probDer = calcOrNull(xInput, (i) =>
    LN.probabilidadAcumuladaDerecha.calcular(i)
  )
  const expIzq = calcOrNull(xInput, (i) =>
    LN.expectativaParcialIzquierda.calcular(i)
  )
  const expDer = calcOrNull(xInput, (i) =>
    LN.expectativaParcialDerecha.calcular(i)
  )
  const promIzq = calcOrNull(xInput, (i) =>
    LN.promedioTruncadoIzquierdo.calcular(i)
  )
  const promDer = calcOrNull(xInput, (i) =>
    LN.promedioTruncadoDerecho.calcular(i)
  )

  const valProbIzq = calcOrNull(pInput, (i) =>
    LN.valorDadaProbabilidadIzquierda.calcular(i)
  )
  const valProbDer = calcOrNull(pInput, (i) =>
    LN.valorDadaProbabilidadDerecha.calcular(i)
  )

  const promDosColas = calcOrNull(abInput, (i) =>
    LN.promedioTruncadoDosColas.calcular(i)
  )

  function formulaValoresX(
    calculo: (typeof LN)["probabilidadAcumuladaIzquierda"],
    resultado: number | null
  ) {
    if (resultado === null || xInput === null) return undefined
    return calculo.formulaConValores(xInput, resultado)
  }

  function formulaValoresP(
    calculo: (typeof LN)["valorDadaProbabilidadIzquierda"],
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
          <h1 className="text-2xl font-semibold tracking-tight">Log-Normal</h1>
          <p className="mt-1 text-sm text-muted-foreground">{LN.descripcion}</p>
        </div>

        <ParametrosPanel spec={LN} onParamsChange={handleParamsChange} />

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
                placeholder="x > 0"
                min={0}
                value={xStr}
                onChange={(e) => setXStr(e.target.value)}
                className="h-8 max-w-40 text-sm"
              />
              {x !== null && !isNaN(x) && x <= 0 && (
                <span className="text-xs text-destructive">
                  x debe ser mayor que 0
                </span>
              )}
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={LN.probabilidadAcumuladaIzquierda.titulo}
                valor={probIzq}
                esProbabilidad
                formulaInfo={{
                  titulo: LN.probabilidadAcumuladaIzquierda.titulo,
                  descripcionTeorica:
                    LN.probabilidadAcumuladaIzquierda.descripcionTeorica,
                  formulaGeneral:
                    LN.probabilidadAcumuladaIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    LN.probabilidadAcumuladaIzquierda,
                    probIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={LN.probabilidadAcumuladaDerecha.titulo}
                valor={probDer}
                esProbabilidad
                formulaInfo={{
                  titulo: LN.probabilidadAcumuladaDerecha.titulo,
                  descripcionTeorica:
                    LN.probabilidadAcumuladaDerecha.descripcionTeorica,
                  formulaGeneral:
                    LN.probabilidadAcumuladaDerecha.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    LN.probabilidadAcumuladaDerecha,
                    probDer
                  ),
                }}
              />
            </div>

            <Separator />

            {/* Esperanza y desvío */}
            {params && (LN.esperanza || LN.desvio) && (
              <>
                <div className="divide-y divide-border/60">
                  {LN.esperanza && (() => {
                    const esp = LN.esperanza.calcular(params)
                    return (
                      <ResultadoFila
                        titulo={LN.esperanza.titulo}
                        valor={esp}
                        formulaInfo={{
                          titulo: LN.esperanza.titulo,
                          descripcionTeorica: LN.esperanza.descripcionTeorica,
                          formulaGeneral: LN.esperanza.formulaGeneral,
                          formulaConValores: LN.esperanza.formulaConValores(params, esp),
                        }}
                      />
                    )
                  })()}
                  {LN.desvio && (() => {
                    const dev = LN.desvio.calcular(params)
                    return (
                      <ResultadoFila
                        titulo={LN.desvio.titulo}
                        valor={dev}
                        formulaInfo={{
                          titulo: LN.desvio.titulo,
                          descripcionTeorica: LN.desvio.descripcionTeorica,
                          formulaGeneral: LN.desvio.formulaGeneral,
                          formulaConValores: LN.desvio.formulaConValores(params, dev),
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
                titulo={LN.expectativaParcialIzquierda.titulo}
                valor={expIzq}
                formulaInfo={{
                  titulo: LN.expectativaParcialIzquierda.titulo,
                  descripcionTeorica:
                    LN.expectativaParcialIzquierda.descripcionTeorica,
                  formulaGeneral: LN.expectativaParcialIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    LN.expectativaParcialIzquierda,
                    expIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={LN.expectativaParcialDerecha.titulo}
                valor={expDer}
                formulaInfo={{
                  titulo: LN.expectativaParcialDerecha.titulo,
                  descripcionTeorica:
                    LN.expectativaParcialDerecha.descripcionTeorica,
                  formulaGeneral: LN.expectativaParcialDerecha.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    LN.expectativaParcialDerecha,
                    expDer
                  ),
                }}
              />
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={LN.promedioTruncadoIzquierdo.titulo}
                valor={promIzq}
                formulaInfo={{
                  titulo: LN.promedioTruncadoIzquierdo.titulo,
                  descripcionTeorica:
                    LN.promedioTruncadoIzquierdo.descripcionTeorica,
                  formulaGeneral: LN.promedioTruncadoIzquierdo.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    LN.promedioTruncadoIzquierdo,
                    promIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={LN.promedioTruncadoDerecho.titulo}
                valor={promDer}
                formulaInfo={{
                  titulo: LN.promedioTruncadoDerecho.titulo,
                  descripcionTeorica:
                    LN.promedioTruncadoDerecho.descripcionTeorica,
                  formulaGeneral: LN.promedioTruncadoDerecho.formulaGeneral,
                  formulaConValores: formulaValoresX(
                    LN.promedioTruncadoDerecho,
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
                titulo={LN.valorDadaProbabilidadIzquierda.titulo}
                valor={valProbIzq}
                formulaInfo={{
                  titulo: LN.valorDadaProbabilidadIzquierda.titulo,
                  descripcionTeorica:
                    LN.valorDadaProbabilidadIzquierda.descripcionTeorica,
                  formulaGeneral:
                    LN.valorDadaProbabilidadIzquierda.formulaGeneral,
                  formulaConValores: formulaValoresP(
                    LN.valorDadaProbabilidadIzquierda,
                    valProbIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={LN.valorDadaProbabilidadDerecha.titulo}
                valor={valProbDer}
                formulaInfo={{
                  titulo: LN.valorDadaProbabilidadDerecha.titulo,
                  descripcionTeorica:
                    LN.valorDadaProbabilidadDerecha.descripcionTeorica,
                  formulaGeneral:
                    LN.valorDadaProbabilidadDerecha.formulaGeneral,
                  formulaConValores: formulaValoresP(
                    LN.valorDadaProbabilidadDerecha,
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
                  placeholder="a"
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
                  placeholder="b"
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
              {a !== null && b !== null && !isNaN(a) && !isNaN(b) && a >= b && (
                <span className="text-xs text-destructive">
                  a debe ser menor que b
                </span>
              )}
            </div>

            <Separator />

            <div className="divide-y divide-border/60">
              {LN.probabilidadIntervalo && (() => {
                const probInt = calcOrNull(abInput, (i) => LN.probabilidadIntervalo!.calcular(i))
                return (
                  <ResultadoFila
                    titulo={LN.probabilidadIntervalo.titulo}
                    valor={probInt}
                    esProbabilidad
                    formulaInfo={{
                      titulo: LN.probabilidadIntervalo.titulo,
                      descripcionTeorica: LN.probabilidadIntervalo.descripcionTeorica,
                      formulaGeneral: LN.probabilidadIntervalo.formulaGeneral,
                      formulaConValores:
                        probInt !== null && abInput !== null
                          ? LN.probabilidadIntervalo.formulaConValores(abInput, probInt)
                          : undefined,
                    }}
                  />
                )
              })()}
              <ResultadoFila
                titulo={LN.promedioTruncadoDosColas.titulo}
                valor={promDosColas}
                formulaInfo={{
                  titulo: LN.promedioTruncadoDosColas.titulo,
                  descripcionTeorica: LN.promedioTruncadoDosColas.descripcionTeorica,
                  formulaGeneral: LN.promedioTruncadoDosColas.formulaGeneral,
                  formulaConValores:
                    promDosColas !== null && abInput !== null
                      ? LN.promedioTruncadoDosColas.formulaConValores(abInput, promDosColas)
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
              {x !== null && !isNaN(x) && x > 0 && (
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
              <LogNormalChart params={params} x={x} modo={modo} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
