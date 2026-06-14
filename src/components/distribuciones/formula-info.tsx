import { useState } from "react"
import { IconInfoCircle } from "@tabler/icons-react"
import { BlockMath } from "@/components/ui/katex"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type FormulaInfoProps = {
  titulo: string
  descripcionTeorica: string
  formulaGeneral: string
  /** Se muestra solo cuando hay valores calculados */
  formulaConValores?: string
}

export function FormulaInfo({
  titulo,
  descripcionTeorica,
  formulaGeneral,
  formulaConValores,
}: FormulaInfoProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={() => setOpen(true)}
        aria-label={`Ver fórmula: ${titulo}`}
        className="shrink-0 text-muted-foreground/60 hover:text-foreground"
      >
        <IconInfoCircle />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-xl">
          {/* Header fijo — no scrollea */}
          <DialogHeader>
            <DialogTitle className="whitespace-pre-line">{titulo}</DialogTitle>
            <DialogDescription>{descripcionTeorica}</DialogDescription>
          </DialogHeader>

          {/* Área de fórmulas scrolleable */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-4 pb-1">
              <div>
                <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Fórmula general
                </p>
                <div className="overflow-x-auto rounded-md bg-muted/40 px-4 py-3">
                  <BlockMath math={formulaGeneral} />
                </div>
              </div>

              {formulaConValores && (
                <div>
                  <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Con los valores ingresados
                  </p>
                  <div className="overflow-x-auto rounded-md bg-muted/40 px-4 py-3">
                    <BlockMath math={formulaConValores} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
