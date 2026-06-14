import { useCallback, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DistribucionNormal, type ParamsNormal } from "@/lib/distribuciones"

import { NormalChart } from "./normal-chart"
import { ParametrosPanel } from "./parametros-panel"
import { ResultadoFila } from "./resultado-fila"

// ── Helper ────────────────────────────────────────────────────
function calcOrNull<T>(input: T | null, fn: (i: T) => number): number | null {
  if (input === null) return null
  try {
    const v = fn(input)
    return isFinite(v) || isNaN(v) ? v : v // devuelve Infinity/-Infinity tal cual
  } catch {
    return null
  }
}

export function NormalDistributionPage() {
  const [params, setParams] = useState<ParamsNormal | null>(null)
  const [modo, setModo] = useState<"izq" | "der">("izq")

  // Inputs de sección 1 (dado un valor x)
  const [xStr, setXStr] = useState("")
  // Inputs de sección 2 (dada una probabilidad p)
  const [pStr, setPStr] = useState("")
  // Inputs de sección 3 (dos colas a ≤ X ≤ b)
  const [aStr, setAStr] = useState("")
  const [bStr, setBStr] = useState("")

  const handleParamsChange = useCallback(
    (p: ParamsNormal | null) => setParams(p),
    []
  )

  // ── Parseo de inputs ─────────────────────────────────────
  const x = xStr !== "" ? parseFloat(xStr) : null
  const p = pStr !== "" ? parseFloat(pStr) : null
  const a = aStr !== "" ? parseFloat(aStr) : null
  const b = bStr !== "" ? parseFloat(bStr) : null

  const xInput = x !== null && !isNaN(x) && params ? { params, x } : null
  const pInput =
    p !== null && !isNaN(p) && p > 0 && p < 1 && params ? { params, p } : null
  const abInput =
    a !== null && b !== null && !isNaN(a) && !isNaN(b) && a < b && params
      ? { params, a, b }
      : null

  // ── Resultados sección 1 ──────────────────────────────────
  const N = DistribucionNormal

  const probIzq = calcOrNull(xInput, (i) =>
    N.probabilidadAcumuladaIzquierda.calcular(i)
  )
  const probDer = calcOrNull(xInput, (i) =>
    N.probabilidadAcumuladaDerecha.calcular(i)
  )
  const expIzq = calcOrNull(xInput, (i) =>
    N.expectativaParcialIzquierda.calcular(i)
  )
  const expDer = calcOrNull(xInput, (i) =>
    N.expectativaParcialDerecha.calcular(i)
  )
  const promIzq = calcOrNull(xInput, (i) =>
    N.promedioTruncadoIzquierdo.calcular(i)
  )
  const promDer = calcOrNull(xInput, (i) =>
    N.promedioTruncadoDerecho.calcular(i)
  )

  // ── Resultados sección 2 ──────────────────────────────────
  const valProbIzq = calcOrNull(pInput, (i) =>
    N.valorDadaProbabilidadIzquierda.calcular(i)
  )
  const valProbDer = calcOrNull(pInput, (i) =>
    N.valorDadaProbabilidadDerecha.calcular(i)
  )

  // ── Resultados sección 3 ──────────────────────────────────
  const promDosColas = calcOrNull(abInput, (i) =>
    N.promedioTruncadoDosColas.calcular(i)
  )

  // ── Fórmulas con valores (solo si hay resultado válido) ───
  function formulaValores1(
    calculo: (typeof N)["probabilidadAcumuladaIzquierda"],
    resultado: number | null
  ) {
    if (resultado === null || xInput === null) return undefined
    return calculo.formulaConValores(xInput, resultado)
  }

  function formulaValores2(
    calculo: (typeof N)["valorDadaProbabilidadIzquierda"],
    resultado: number | null
  ) {
    if (resultado === null || pInput === null) return undefined
    return calculo.formulaConValores(pInput, resultado)
  }

  return (
    <div className="flex gap-6">
      {/* ── Columna izquierda: parámetros + cálculos ── */}
      <div className="flex max-w-xl min-w-0 flex-1 flex-col gap-6">
        {/* Encabezado */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Normal</h1>
          <p className="mt-1 text-sm text-muted-foreground">{N.descripcion}</p>
        </div>

        {/* Parámetros */}
        <ParametrosPanel spec={N} onParamsChange={handleParamsChange} />

        {/* ── Sección 1: dado un valor x ── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Dado un valor</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0">
            {/* Input x */}
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

            {/* Acumuladas */}
            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={N.probabilidadAcumuladaIzquierda.titulo}
                valor={probIzq}
                esProbabilidad
                formulaInfo={{
                  titulo: N.probabilidadAcumuladaIzquierda.titulo,
                  descripcionTeorica:
                    N.probabilidadAcumuladaIzquierda.descripcionTeorica,
                  formulaGeneral:
                    N.probabilidadAcumuladaIzquierda.formulaGeneral,
                  formulaConValores: formulaValores1(
                    N.probabilidadAcumuladaIzquierda,
                    probIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={N.probabilidadAcumuladaDerecha.titulo}
                valor={probDer}
                esProbabilidad
                formulaInfo={{
                  titulo: N.probabilidadAcumuladaDerecha.titulo,
                  descripcionTeorica:
                    N.probabilidadAcumuladaDerecha.descripcionTeorica,
                  formulaGeneral: N.probabilidadAcumuladaDerecha.formulaGeneral,
                  formulaConValores: formulaValores1(
                    N.probabilidadAcumuladaDerecha,
                    probDer
                  ),
                }}
              />
            </div>

            <Separator />

            {/* Esperanza y desvío */}
            {params && (N.esperanza || N.desvio) && (
              <>
                <div className="divide-y divide-border/60">
                  {N.esperanza && (() => {
                    const esp = N.esperanza.calcular(params)
                    return (
                      <ResultadoFila
                        titulo={N.esperanza.titulo}
                        valor={esp}
                        formulaInfo={{
                          titulo: N.esperanza.titulo,
                          descripcionTeorica: N.esperanza.descripcionTeorica,
                          formulaGeneral: N.esperanza.formulaGeneral,
                          formulaConValores: N.esperanza.formulaConValores(params, esp),
                        }}
                      />
                    )
                  })()}
                  {N.desvio && (() => {
                    const dev = N.desvio.calcular(params)
                    return (
                      <ResultadoFila
                        titulo={N.desvio.titulo}
                        valor={dev}
                        formulaInfo={{
                          titulo: N.desvio.titulo,
                          descripcionTeorica: N.desvio.descripcionTeorica,
                          formulaGeneral: N.desvio.formulaGeneral,
                          formulaConValores: N.desvio.formulaConValores(params, dev),
                        }}
                      />
                    )
                  })()}
                </div>
                <Separator />
              </>
            )}

            {/* Expectativas parciales */}
            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={N.expectativaParcialIzquierda.titulo}
                valor={expIzq}
                formulaInfo={{
                  titulo: N.expectativaParcialIzquierda.titulo,
                  descripcionTeorica:
                    N.expectativaParcialIzquierda.descripcionTeorica,
                  formulaGeneral: N.expectativaParcialIzquierda.formulaGeneral,
                  formulaConValores: formulaValores1(
                    N.expectativaParcialIzquierda,
                    expIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={N.expectativaParcialDerecha.titulo}
                valor={expDer}
                formulaInfo={{
                  titulo: N.expectativaParcialDerecha.titulo,
                  descripcionTeorica:
                    N.expectativaParcialDerecha.descripcionTeorica,
                  formulaGeneral: N.expectativaParcialDerecha.formulaGeneral,
                  formulaConValores: formulaValores1(
                    N.expectativaParcialDerecha,
                    expDer
                  ),
                }}
              />
            </div>

            <Separator />

            {/* Promedios truncados izq/der */}
            <div className="divide-y divide-border/60">
              <ResultadoFila
                titulo={N.promedioTruncadoIzquierdo.titulo}
                valor={promIzq}
                formulaInfo={{
                  titulo: N.promedioTruncadoIzquierdo.titulo,
                  descripcionTeorica:
                    N.promedioTruncadoIzquierdo.descripcionTeorica,
                  formulaGeneral: N.promedioTruncadoIzquierdo.formulaGeneral,
                  formulaConValores: formulaValores1(
                    N.promedioTruncadoIzquierdo,
                    promIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={N.promedioTruncadoDerecho.titulo}
                valor={promDer}
                formulaInfo={{
                  titulo: N.promedioTruncadoDerecho.titulo,
                  descripcionTeorica:
                    N.promedioTruncadoDerecho.descripcionTeorica,
                  formulaGeneral: N.promedioTruncadoDerecho.formulaGeneral,
                  formulaConValores: formulaValores1(
                    N.promedioTruncadoDerecho,
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
                titulo={N.valorDadaProbabilidadIzquierda.titulo}
                valor={valProbIzq}
                formulaInfo={{
                  titulo: N.valorDadaProbabilidadIzquierda.titulo,
                  descripcionTeorica:
                    N.valorDadaProbabilidadIzquierda.descripcionTeorica,
                  formulaGeneral:
                    N.valorDadaProbabilidadIzquierda.formulaGeneral,
                  formulaConValores: formulaValores2(
                    N.valorDadaProbabilidadIzquierda,
                    valProbIzq
                  ),
                }}
              />
              <ResultadoFila
                titulo={N.valorDadaProbabilidadDerecha.titulo}
                valor={valProbDer}
                formulaInfo={{
                  titulo: N.valorDadaProbabilidadDerecha.titulo,
                  descripcionTeorica:
                    N.valorDadaProbabilidadDerecha.descripcionTeorica,
                  formulaGeneral: N.valorDadaProbabilidadDerecha.formulaGeneral,
                  formulaConValores: formulaValores2(
                    N.valorDadaProbabilidadDerecha,
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
              {N.probabilidadIntervalo && (() => {
                const probInt = calcOrNull(abInput, (i) => N.probabilidadIntervalo!.calcular(i))
                return (
                  <ResultadoFila
                    titulo={N.probabilidadIntervalo.titulo}
                    valor={probInt}
                    esProbabilidad
                    formulaInfo={{
                      titulo: N.probabilidadIntervalo.titulo,
                      descripcionTeorica: N.probabilidadIntervalo.descripcionTeorica,
                      formulaGeneral: N.probabilidadIntervalo.formulaGeneral,
                      formulaConValores:
                        probInt !== null && abInput !== null
                          ? N.probabilidadIntervalo.formulaConValores(abInput, probInt)
                          : undefined,
                    }}
                  />
                )
              })()}
              <ResultadoFila
                titulo={N.promedioTruncadoDosColas.titulo}
                valor={promDosColas}
                formulaInfo={{
                  titulo: N.promedioTruncadoDosColas.titulo,
                  descripcionTeorica: N.promedioTruncadoDosColas.descripcionTeorica,
                  formulaGeneral: N.promedioTruncadoDosColas.formulaGeneral,
                  formulaConValores:
                    promDosColas !== null && abInput !== null
                      ? N.promedioTruncadoDosColas.formulaConValores(abInput, promDosColas)
                      : undefined,
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* fin columna izquierda */}

      {/* ── Columna derecha: gráfico sticky ── */}
      {params && (
        <div className="sticky mt-30 shrink-0">
          <Card className="">
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
              <NormalChart params={params} x={x} modo={modo} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
