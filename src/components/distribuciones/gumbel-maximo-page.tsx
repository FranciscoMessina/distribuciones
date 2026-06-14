import { useCallback, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { DistribucionGumbelMaximo, type ParamsGumbelMaximo } from "@/lib/distribuciones"

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

export function GumbelMaximoDistributionPage() {
  const [params, setParams] = useState<ParamsGumbelMaximo | null>(null)

  const [xStr, setXStr] = useState("")
  const [pStr, setPStr] = useState("")
  const [aStr, setAStr] = useState("")
  const [bStr, setBStr] = useState("")

  const handleParamsChange = useCallback(
    (p: ParamsGumbelMaximo | null) => setParams(p),
    []
  )

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

  const G = DistribucionGumbelMaximo

  const probIzq = calcOrNull(xInput, (i) => G.probabilidadAcumuladaIzquierda.calcular(i))
  const probDer = calcOrNull(xInput, (i) => G.probabilidadAcumuladaDerecha.calcular(i))
  const expIzq = calcOrNull(xInput, (i) => G.expectativaParcialIzquierda.calcular(i))
  const expDer = calcOrNull(xInput, (i) => G.expectativaParcialDerecha.calcular(i))
  const promIzq = calcOrNull(xInput, (i) => G.promedioTruncadoIzquierdo.calcular(i))
  const promDer = calcOrNull(xInput, (i) => G.promedioTruncadoDerecho.calcular(i))

  const valProbIzq = calcOrNull(pInput, (i) => G.valorDadaProbabilidadIzquierda.calcular(i))
  const valProbDer = calcOrNull(pInput, (i) => G.valorDadaProbabilidadDerecha.calcular(i))

  const promDosColas = calcOrNull(abInput, (i) => G.promedioTruncadoDosColas.calcular(i))

  function formulaValoresX(
    calculo: (typeof G)["probabilidadAcumuladaIzquierda"],
    resultado: number | null
  ) {
    if (resultado === null || xInput === null) return undefined
    return calculo.formulaConValores(xInput, resultado)
  }

  function formulaValoresP(
    calculo: (typeof G)["valorDadaProbabilidadIzquierda"],
    resultado: number | null
  ) {
    if (resultado === null || pInput === null) return undefined
    return calculo.formulaConValores(pInput, resultado)
  }

  return (
    <div className="flex max-w-xl min-w-0 flex-1 flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Gumbel máximo</h1>
        <p className="mt-1 text-sm text-muted-foreground">{G.descripcion}</p>
      </div>

      <ParametrosPanel spec={G} onParamsChange={handleParamsChange} />

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
              titulo={G.probabilidadAcumuladaIzquierda.titulo}
              valor={probIzq}
              esProbabilidad
              formulaInfo={{
                titulo: G.probabilidadAcumuladaIzquierda.titulo,
                descripcionTeorica: G.probabilidadAcumuladaIzquierda.descripcionTeorica,
                formulaGeneral: G.probabilidadAcumuladaIzquierda.formulaGeneral,
                formulaConValores: formulaValoresX(G.probabilidadAcumuladaIzquierda, probIzq),
              }}
            />
            <ResultadoFila
              titulo={G.probabilidadAcumuladaDerecha.titulo}
              valor={probDer}
              esProbabilidad
              formulaInfo={{
                titulo: G.probabilidadAcumuladaDerecha.titulo,
                descripcionTeorica: G.probabilidadAcumuladaDerecha.descripcionTeorica,
                formulaGeneral: G.probabilidadAcumuladaDerecha.formulaGeneral,
                formulaConValores: formulaValoresX(G.probabilidadAcumuladaDerecha, probDer),
              }}
            />
          </div>

          <Separator />

          {params && (G.esperanza || G.desvio) && (
            <>
              <div className="divide-y divide-border/60">
                {G.esperanza && (() => {
                  const esp = G.esperanza.calcular(params)
                  return (
                    <ResultadoFila
                      titulo={G.esperanza.titulo}
                      valor={esp}
                      formulaInfo={{
                        titulo: G.esperanza.titulo,
                        descripcionTeorica: G.esperanza.descripcionTeorica,
                        formulaGeneral: G.esperanza.formulaGeneral,
                        formulaConValores: G.esperanza.formulaConValores(params, esp),
                      }}
                    />
                  )
                })()}
                {G.desvio && (() => {
                  const dev = G.desvio.calcular(params)
                  return (
                    <ResultadoFila
                      titulo={G.desvio.titulo}
                      valor={dev}
                      formulaInfo={{
                        titulo: G.desvio.titulo,
                        descripcionTeorica: G.desvio.descripcionTeorica,
                        formulaGeneral: G.desvio.formulaGeneral,
                        formulaConValores: G.desvio.formulaConValores(params, dev),
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
              titulo={G.expectativaParcialIzquierda.titulo}
              valor={expIzq}
              formulaInfo={{
                titulo: G.expectativaParcialIzquierda.titulo,
                descripcionTeorica: G.expectativaParcialIzquierda.descripcionTeorica,
                formulaGeneral: G.expectativaParcialIzquierda.formulaGeneral,
                formulaConValores: formulaValoresX(G.expectativaParcialIzquierda, expIzq),
              }}
            />
            <ResultadoFila
              titulo={G.expectativaParcialDerecha.titulo}
              valor={expDer}
              formulaInfo={{
                titulo: G.expectativaParcialDerecha.titulo,
                descripcionTeorica: G.expectativaParcialDerecha.descripcionTeorica,
                formulaGeneral: G.expectativaParcialDerecha.formulaGeneral,
                formulaConValores: formulaValoresX(G.expectativaParcialDerecha, expDer),
              }}
            />
          </div>

          <Separator />

          <div className="divide-y divide-border/60">
            <ResultadoFila
              titulo={G.promedioTruncadoIzquierdo.titulo}
              valor={promIzq}
              formulaInfo={{
                titulo: G.promedioTruncadoIzquierdo.titulo,
                descripcionTeorica: G.promedioTruncadoIzquierdo.descripcionTeorica,
                formulaGeneral: G.promedioTruncadoIzquierdo.formulaGeneral,
                formulaConValores: formulaValoresX(G.promedioTruncadoIzquierdo, promIzq),
              }}
            />
            <ResultadoFila
              titulo={G.promedioTruncadoDerecho.titulo}
              valor={promDer}
              formulaInfo={{
                titulo: G.promedioTruncadoDerecho.titulo,
                descripcionTeorica: G.promedioTruncadoDerecho.descripcionTeorica,
                formulaGeneral: G.promedioTruncadoDerecho.formulaGeneral,
                formulaConValores: formulaValoresX(G.promedioTruncadoDerecho, promDer),
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
              titulo={G.valorDadaProbabilidadIzquierda.titulo}
              valor={valProbIzq}
              formulaInfo={{
                titulo: G.valorDadaProbabilidadIzquierda.titulo,
                descripcionTeorica: G.valorDadaProbabilidadIzquierda.descripcionTeorica,
                formulaGeneral: G.valorDadaProbabilidadIzquierda.formulaGeneral,
                formulaConValores: formulaValoresP(G.valorDadaProbabilidadIzquierda, valProbIzq),
              }}
            />
            <ResultadoFila
              titulo={G.valorDadaProbabilidadDerecha.titulo}
              valor={valProbDer}
              formulaInfo={{
                titulo: G.valorDadaProbabilidadDerecha.titulo,
                descripcionTeorica: G.valorDadaProbabilidadDerecha.descripcionTeorica,
                formulaGeneral: G.valorDadaProbabilidadDerecha.formulaGeneral,
                formulaConValores: formulaValoresP(G.valorDadaProbabilidadDerecha, valProbDer),
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
            {G.probabilidadIntervalo && (() => {
              const probInt = calcOrNull(abInput, (i) => G.probabilidadIntervalo!.calcular(i))
              return (
                <ResultadoFila
                  titulo={G.probabilidadIntervalo.titulo}
                  valor={probInt}
                  esProbabilidad
                  formulaInfo={{
                    titulo: G.probabilidadIntervalo.titulo,
                    descripcionTeorica: G.probabilidadIntervalo.descripcionTeorica,
                    formulaGeneral: G.probabilidadIntervalo.formulaGeneral,
                    formulaConValores:
                      probInt !== null && abInput !== null
                        ? G.probabilidadIntervalo.formulaConValores(abInput, probInt)
                        : undefined,
                  }}
                />
              )
            })()}
            <ResultadoFila
              titulo={G.promedioTruncadoDosColas.titulo}
              valor={promDosColas}
              formulaInfo={{
                titulo: G.promedioTruncadoDosColas.titulo,
                descripcionTeorica: G.promedioTruncadoDosColas.descripcionTeorica,
                formulaGeneral: G.promedioTruncadoDosColas.formulaGeneral,
                formulaConValores:
                  promDosColas !== null && abInput !== null
                    ? G.promedioTruncadoDosColas.formulaConValores(abInput, promDosColas)
                    : undefined,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
