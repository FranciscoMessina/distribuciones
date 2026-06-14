import { useCallback, useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type {
  DerivacionDeParametros,
  DistribucionSpec,
  FormulaRender,
  InputDerivacion,
  ParametroDef,
} from "@/lib/distribuciones/tipos"
import { DerivacionParametros } from "./derivacion-parametros"

// modo "native" = parámetros directos; número = índice en derivacionesDeParametros
type Modo = "native" | number

type ParametrosPanelProps<P extends Record<string, number>> = {
  spec: Pick<
    DistribucionSpec<P>,
    "parametros" | "derivacionesDeParametros" | "nombre"
  >
  onParamsChange: (params: P | null) => void
}

/** Devuelve un mensaje de error si el valor no pasa la validación, o null si es correcto. */
function mensajeError(
  valor: string,
  def: ParametroDef | InputDerivacion
): string | null {
  if (valor === "") return null
  const v = parseFloat(valor)
  if (isNaN(v) || !isFinite(v)) return "Debe ser un número válido"
  if (def.min !== undefined && v <= def.min) {
    return def.min === 0
      ? "Debe ser mayor que 0"
      : `Debe ser mayor que ${def.min}`
  }
  if (def.max !== undefined && v >= def.max) {
    return `Debe ser menor que ${def.max}`
  }
  return null
}

function todosValidos(
  vals: string[],
  defs: (ParametroDef | InputDerivacion)[]
): boolean {
  return defs.every(
    (def, i) => mensajeError(vals[i] ?? "", def) === null && vals[i] !== ""
  )
}

export function ParametrosPanel<P extends Record<string, number>>({
  spec,
  onParamsChange,
}: ParametrosPanelProps<P>) {
  const derivaciones = spec.derivacionesDeParametros ?? []

  const [modo, setModo] = useState<Modo>("native")
  const [nativeVals, setNativeVals] = useState<Record<string, string>>(() =>
    Object.fromEntries(spec.parametros.map((p) => [p.clave, ""]))
  )
  // Por cada derivación: array de strings, uno por input
  const [derivacionVals, setDerivacionVals] = useState<
    Record<number, string[]>
  >(() =>
    Object.fromEntries(derivaciones.map((d, i) => [i, d.inputs.map(() => "")]))
  )
  const [pasos, setPasos] = useState<FormulaRender[]>([])

  // ── Helpers ──────────────────────────────────────────────

  const emitNative = useCallback(
    (vals: Record<string, string>) => {
      const parsed = Object.fromEntries(
        spec.parametros.map((p) => [p.clave, parseFloat(vals[p.clave] ?? "")])
      )
      const valido = Object.entries(parsed).every(([clave, v]) => {
        if (isNaN(v) || !isFinite(v)) return false
        const def = spec.parametros.find((p) => p.clave === clave)
        if (def?.min !== undefined && v <= def.min) return false
        return true
      })
      onParamsChange(valido ? (parsed as P) : null)
    },
    [spec.parametros, onParamsChange]
  )

  const emitDerivacion = useCallback(
    (_: number, vals: string[], derivacion: DerivacionDeParametros<P>) => {
      if (!todosValidos(vals, derivacion.inputs)) {
        setPasos([])
        onParamsChange(null)
        return
      }
      const nums = vals.map((v) => parseFloat(v))
      const resultado = derivacion.derivar(nums)
      if (!resultado) {
        setPasos([])
        onParamsChange(null)
        return
      }
      const { params, pasos: ps } = resultado
      const valido = Object.values(params).every(
        (v) => !isNaN(v as number) && isFinite(v as number)
      )
      setPasos(ps)
      onParamsChange(valido ? params : null)
    },
    [onParamsChange]
  )

  // ── Handlers ─────────────────────────────────────────────

  function handleModoChange(val: string) {
    if (!val) return
    const nuevo: Modo = val === "native" ? "native" : parseInt(val, 10)
    if (nuevo === modo) return
    setModo(nuevo)
    setPasos([])
    onParamsChange(null)
    if (nuevo === "native") {
      emitNative(nativeVals)
    } else {
      const d = derivaciones[nuevo as number]
      if (d)
        emitDerivacion(
          nuevo as number,
          derivacionVals[nuevo as number] ?? [],
          d
        )
    }
  }

  function handleNativeChange(clave: string, valor: string) {
    const next = { ...nativeVals, [clave]: valor }
    setNativeVals(next)
    emitNative(next)
  }

  function handleDerivacionChange(
    idx: number,
    inputIdx: number,
    valor: string
  ) {
    const prev = derivacionVals[idx] ?? derivaciones[idx].inputs.map(() => "")
    const next = prev.map((v, i) => (i === inputIdx ? valor : v))
    setDerivacionVals((old) => ({ ...old, [idx]: next }))
    emitDerivacion(idx, next, derivaciones[idx])
  }

  // ── Render ───────────────────────────────────────────────

  const modoStr = typeof modo === "number" ? String(modo) : modo

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium">Parámetros</h2>
        {derivaciones.length > 0 && (
          <ToggleGroup
            value={[modoStr]}
            onValueChange={(vals: string[]) => {
              const nuevo = vals.find((v) => v !== modoStr) ?? modoStr
              handleModoChange(nuevo)
            }}
            className="h-7 text-xs"
            spacing={0}
          >
            <ToggleGroupItem value="native" className="h-7 px-2.5 text-xs">
              Parámetros
            </ToggleGroupItem>
            {derivaciones.map((d, i) => (
              <ToggleGroupItem
                key={i}
                value={String(i)}
                className="h-7 px-2.5 text-xs"
              >
                {d.etiquetaBoton}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
      </div>

      {modo === "native" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {spec.parametros.map((p) => {
            const error = mensajeError(nativeVals[p.clave] ?? "", p)
            return (
              <div key={p.clave} className="flex flex-col gap-1.5">
                <Label htmlFor={`param-${p.clave}`} className="text-xs">
                  {p.etiqueta}
                </Label>
                <Input
                  id={`param-${p.clave}`}
                  type="number"
                  placeholder={p.simbolo}
                  value={nativeVals[p.clave] ?? ""}
                  onChange={(e) => handleNativeChange(p.clave, e.target.value)}
                  aria-invalid={!!error}
                  className="h-8 text-sm"
                />
                {error && <p className="text-xs text-destructive">{error}</p>}
              </div>
            )
          })}
        </div>
      ) : (
        (() => {
          const idx = modo as number
          const derivacion = derivaciones[idx]
          const vals = derivacionVals[idx] ?? derivacion.inputs.map(() => "")
          return (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                {derivacion.inputs.map((inputDef, inputIdx) => {
                  const error = mensajeError(vals[inputIdx] ?? "", inputDef)
                  return (
                    <div key={inputIdx} className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`param-d${idx}-${inputIdx}`}
                        className="text-xs"
                      >
                        {inputDef.etiqueta}
                      </Label>
                      <Input
                        id={`param-d${idx}-${inputIdx}`}
                        type="number"
                        placeholder={inputDef.placeholder}
                        value={vals[inputIdx] ?? ""}
                        onChange={(e) =>
                          handleDerivacionChange(idx, inputIdx, e.target.value)
                        }
                        aria-invalid={!!error}
                        className="h-8 text-sm"
                      />
                      {error && (
                        <p className="text-xs text-destructive">{error}</p>
                      )}
                    </div>
                  )
                })}
              </div>
              {pasos.length > 0 && <DerivacionParametros pasos={pasos} />}
            </div>
          )
        })()
      )}
    </div>
  )
}
