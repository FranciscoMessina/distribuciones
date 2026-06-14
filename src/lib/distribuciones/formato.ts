// ============================================================
// Utilidades de formato para resultados de distribuciones
// ============================================================

/**
 * Formato para el resumen: 4 decimales fijos.
 * Si el valor es no-nulo pero redondea a "0.0000", usa 4 cifras significativas
 * para no mostrar un cero engañoso.
 */
export function formatoResumen(valor: number): string {
  if (isNaN(valor)) return "—"
  if (!isFinite(valor)) return valor > 0 ? "+∞" : "−∞"

  const fixed = valor.toFixed(4)
  if ((fixed === "0.0000" || fixed === "-0.0000") && valor !== 0) {
    return valor.toPrecision(4)
  }
  return fixed
}

/**
 * Formato para el detalle: todos los decimales disponibles de JavaScript.
 * Se muestra debajo del resumen o en el modal.
 */
export function formatoDetalle(valor: number): string {
  if (isNaN(valor)) return "—"
  if (!isFinite(valor)) return valor > 0 ? "+∞" : "−∞"
  return String(valor)
}

/**
 * Convierte una probabilidad ∈ [0, 1] a su representación porcentual con 4 decimales.
 * Aplica el mismo fallback de cifras significativas que formatoResumen cuando el
 * porcentaje redondea a "0.0000 %".
 */
export function formatoPorcentaje(valor: number): string {
  if (isNaN(valor)) return "—"
  if (!isFinite(valor)) return valor > 0 ? "+∞ %" : "−∞ %"
  const pct = valor * 100
  const fixed = pct.toFixed(2)
  if ((fixed === "0.00" || fixed === "-0.00") && valor !== 0) {
    return parseFloat(pct.toPrecision(2)).toString() + " %"
  }
  return fixed + " %"
}

/**
 * Formatea un número para incrustar en una fórmula LaTeX.
 * Enteros sin decimales; reales con hasta 6 cifras significativas, sin ceros finales.
 */
export function numeroLatex(valor: number): string {
  if (!isFinite(valor)) return valor > 0 ? "\\infty" : "-\\infty"
  if (isNaN(valor)) return "?"
  if (Number.isInteger(valor)) return String(valor)
  // Hasta 6 cifras significativas, eliminando ceros finales
  return parseFloat(valor.toPrecision(6)).toString()
}
