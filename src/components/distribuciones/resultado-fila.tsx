import {
  formatoDetalle,
  formatoPorcentaje,
  formatoResumen,
} from "@/lib/distribuciones/formato"
import type { FormulaInfoProps } from "./formula-info"
import { FormulaInfo } from "./formula-info"

type ResultadoFilaProps = {
  titulo: string
  /** null cuando los inputs son inválidos o están vacíos */
  valor: number | null
  formulaInfo: FormulaInfoProps
  /** Cuando el resultado es una probabilidad ∈ [0,1], muestra también el porcentaje */
  esProbabilidad?: boolean
}

export function ResultadoFila({
  titulo,
  valor,
  formulaInfo,
  esProbabilidad,
}: ResultadoFilaProps) {
  const esValido = valor !== null && !isNaN(valor)
  const resumen = esValido ? formatoResumen(valor!) : null
  const detalle = esValido ? formatoDetalle(valor!) : null
  const muestraDetalle =
    resumen !== null && detalle !== null && resumen !== detalle
  const porcentaje =
    esValido && esProbabilidad ? formatoPorcentaje(valor!) : null

  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      {/* Izquierda: ícono de info + nombre del cálculo */}
      <div className="flex min-w-0 items-center gap-1">
        <FormulaInfo {...formulaInfo} />
        <span className="whitespace-pre-line text-sm text-muted-foreground">{titulo}</span>
      </div>

      {/* Derecha: valor resumen + porcentaje + detalle */}
      <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
        {esValido ? (
          <>
            <span className="font-mono text-sm font-medium tabular-nums">
              {resumen}
            </span>
            {porcentaje && (
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {porcentaje}
              </span>
            )}
            {muestraDetalle && (
              <span className="font-mono text-xs text-muted-foreground/70 tabular-nums">
                {detalle}
              </span>
            )}
          </>
        ) : (
          <span className="text-sm text-muted-foreground/40">—</span>
        )}
      </div>
    </div>
  )
}
