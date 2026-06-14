import { InlineMath } from "@/components/ui/katex"
import type { FormulaRender } from "@/lib/distribuciones/tipos"

type DerivacionParametrosProps = {
  pasos: FormulaRender[]
}

/**
 * Muestra los pasos de derivación de parámetros nativos a partir de media/desvío.
 * Cada paso tiene una fórmula general y la misma con los valores reemplazados.
 */
export function DerivacionParametros({ pasos }: DerivacionParametrosProps) {
  if (pasos.length === 0) return null

  return (
    <div className="mt-3 rounded-md border border-border/60 bg-muted/30 px-3 py-2.5">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Parámetros derivados
      </p>
      <ul className="flex flex-col gap-1.5">
        {pasos.map((paso, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className="min-w-0 shrink text-muted-foreground">
              <InlineMath math={paso.general} />
            </span>
            <span className="text-muted-foreground/50">→</span>
            <span className="shrink-0 font-medium">
              <InlineMath math={paso.conValores} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
