// ============================================================
// Distribución Uniforme  X ~ U(a, b)
// Parámetros: a ∈ ℝ (mínimo), b > a (máximo)
// Soporte: x ∈ [a, b]
// ============================================================

import type {
  DistribucionSpec,
  EntradaDosColas,
  EntradaP,
  EntradaX,
} from "./tipos"
import { numeroLatex } from "./formato"

export type ParamsUniforme = { a: number; b: number }

/** Expectativa parcial izquierda: ∫_a^x t·f(t)dt = (x²−a²)/(2(b−a)) */
function hIzq(x: number, a: number, b: number): number {
  const xc = Math.max(a, Math.min(b, x))
  return (xc * xc - a * a) / (2 * (b - a))
}

/** Expectativa parcial derecha: ∫_x^b t·f(t)dt = (b²−x²)/(2(b−a)) */
function hDer(x: number, a: number, b: number): number {
  const xc = Math.max(a, Math.min(b, x))
  return (b * b - xc * xc) / (2 * (b - a))
}

export const DistribucionUniforme: DistribucionSpec<ParamsUniforme> = {
  slug: "uniforme",
  nombre: "Uniforme",
  descripcion:
    "La distribución uniforme asigna igual probabilidad a cualquier valor dentro del intervalo [a, b]. " +
    "Es la distribución de máxima entropía para un soporte acotado conocido.",

  parametros: [
    { clave: "a", simbolo: "a", etiqueta: "Mínimo (a)" },
    { clave: "b", simbolo: "b", etiqueta: "Máximo (b)", min: undefined },
  ],

  pdf(x, { a, b }) {
    if (x < a || x > b) return 0
    return 1 / (b - a)
  },

  cdf(x, { a, b }) {
    if (x < a) return 0
    if (x > b) return 1
    return (x - a) / (b - a)
  },

  cuantil(p, { a, b }) {
    return a + p * (b - a)
  },

  // ── 1. Probabilidad acumulada izquierda ────────────────────

  probabilidadAcumuladaIzquierda: {
    titulo: "Probabilidad acumulada izquierda \n P(X ≤ x) o F(X)",
    descripcionTeorica:
      "La probabilidad acumulada izquierda P(X ≤ x) es el área bajo la densidad uniforme " +
      "desde a hasta x. Como la densidad es constante 1/(b−a), el área es proporcional " +
      "a la longitud del intervalo [a, x].",
    formulaGeneral:
      "F_{UNI}(x|a;b) = \\frac{x - a}{b - a}, \\quad a \\leq x \\leq b",
    calcular({ params: { a, b }, x }: EntradaX<ParamsUniforme>) {
      if (x < a) return 0
      if (x > b) return 1
      return (x - a) / (b - a)
    },
    formulaConValores(
      { params: { a, b }, x }: EntradaX<ParamsUniforme>,
      resultado: number
    ) {
      return `F_{UNI}(${numeroLatex(x)}|${numeroLatex(a)};${numeroLatex(b)}) = \\frac{${numeroLatex(x)} - ${numeroLatex(a)}}{${numeroLatex(b)} - ${numeroLatex(a)}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 2. Probabilidad acumulada derecha ──────────────────────

  probabilidadAcumuladaDerecha: {
    titulo: "Probabilidad acumulada derecha \n P(X > x) o G(x)",
    descripcionTeorica:
      "La probabilidad acumulada derecha P(X > x) es el complemento de la acumulada izquierda. " +
      "Representa la fracción del intervalo [a, b] que queda a la derecha de x.",
    formulaGeneral:
      "G_{UNI}(x|a;b) = \\frac{b - x}{b - a}, \\quad a \\leq x \\leq b",
    calcular({ params: { a, b }, x }: EntradaX<ParamsUniforme>) {
      if (x < a) return 1
      if (x > b) return 0
      return (b - x) / (b - a)
    },
    formulaConValores(
      { params: { a, b }, x }: EntradaX<ParamsUniforme>,
      resultado: number
    ) {
      return `G_{UNI}(${numeroLatex(x)}|${numeroLatex(a)};${numeroLatex(b)}) = \\frac{${numeroLatex(b)} - ${numeroLatex(x)}}{${numeroLatex(b)} - ${numeroLatex(a)}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 3. Valor dado probabilidad izquierda ───────────────────

  valorDadaProbabilidadIzquierda: {
    titulo: "Valor dado probabilidad izquierda",
    descripcionTeorica:
      "El cuantil izquierdo (fractil) es el valor x tal que P(X ≤ x) = α. " +
      "Se obtiene invirtiendo la CDF: x = a + α·(b−a).",
    formulaGeneral: "x_{(\\alpha)} = a + \\alpha \\cdot (b - a)",
    calcular({ params: { a, b }, p }: EntradaP<ParamsUniforme>) {
      return a + p * (b - a)
    },
    formulaConValores(
      { params: { a, b }, p }: EntradaP<ParamsUniforme>,
      resultado: number
    ) {
      return `x_{(${numeroLatex(p)})} = ${numeroLatex(a)} + ${numeroLatex(p)} \\cdot (${numeroLatex(b)} - ${numeroLatex(a)}) = ${numeroLatex(resultado)}`
    },
  },

  // ── 4. Valor dado probabilidad derecha ─────────────────────

  valorDadaProbabilidadDerecha: {
    titulo: "Valor dado probabilidad derecha",
    descripcionTeorica:
      "El cuantil derecho es el valor x tal que P(X > x) = α, " +
      "equivalente a P(X ≤ x) = 1 − α. Se aplica la fórmula del fractil con 1 − α.",
    formulaGeneral:
      "x = a + (1 - \\alpha) \\cdot (b - a) = b - \\alpha \\cdot (b - a)",
    calcular({ params: { a, b }, p }: EntradaP<ParamsUniforme>) {
      return b - p * (b - a)
    },
    formulaConValores(
      { params: { a, b }, p }: EntradaP<ParamsUniforme>,
      resultado: number
    ) {
      return `x = ${numeroLatex(b)} - ${numeroLatex(p)} \\cdot (${numeroLatex(b)} - ${numeroLatex(a)}) = ${numeroLatex(resultado)}`
    },
  },

  // ── 5. Expectativa parcial izquierda ───────────────────────

  expectativaParcialIzquierda: {
    titulo: "Expectativa parcial izquierda \n H(x)",
    descripcionTeorica:
      "La expectativa parcial izquierda H_UNI(x/a;b) = ∫_a^x t · f(t) dt " +
      "se obtiene integrando t/(b−a) desde a hasta x. " +
      "El resultado es (x²−a²)/(2(b−a)) = (x−a)(x+a)/(2(b−a)).",
    formulaGeneral: "H_{UNI}(x/a;b) = \\frac{(x - a)(x + a)}{2(b - a)}",
    calcular({ params: { a, b }, x }: EntradaX<ParamsUniforme>) {
      if (x <= a) return 0
      if (x >= b) return (a + b) / 2
      return hIzq(x, a, b)
    },
    formulaConValores(
      { params: { a, b }, x }: EntradaX<ParamsUniforme>,
      resultado: number
    ) {
      return (
        `H_{UNI}(${numeroLatex(x)}/${numeroLatex(a)};${numeroLatex(b)}) = ` +
        `\\frac{(${numeroLatex(x)} - ${numeroLatex(a)})(${numeroLatex(x)} + ${numeroLatex(a)})}{2 \\cdot (${numeroLatex(b)} - ${numeroLatex(a)})} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 6. Expectativa parcial derecha ─────────────────────────

  expectativaParcialDerecha: {
    titulo: "Expectativa parcial derecha \n J(x)",
    descripcionTeorica:
      "La expectativa parcial derecha J_UNI(x/a;b) = ∫_x^b t · f(t) dt " +
      "se obtiene integrando t/(b−a) desde x hasta b. " +
      "El resultado es (b²−x²)/(2(b−a)) = (b−x)(b+x)/(2(b−a)). " +
      "La suma H + J = E[X] = (a+b)/2.",
    formulaGeneral: "J_{UNI}(x/a;b) = \\frac{(b - x)(b + x)}{2(b - a)}",
    calcular({ params: { a, b }, x }: EntradaX<ParamsUniforme>) {
      if (x <= a) return (a + b) / 2
      if (x >= b) return 0
      return hDer(x, a, b)
    },
    formulaConValores(
      { params: { a, b }, x }: EntradaX<ParamsUniforme>,
      resultado: number
    ) {
      return (
        `J_{UNI}(${numeroLatex(x)}/${numeroLatex(a)};${numeroLatex(b)}) = ` +
        `\\frac{(${numeroLatex(b)} - ${numeroLatex(x)})(${numeroLatex(b)} + ${numeroLatex(x)})}{2 \\cdot (${numeroLatex(b)} - ${numeroLatex(a)})} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 7. Promedio truncado izquierdo ─────────────────────────

  promedioTruncadoIzquierdo: {
    titulo: "Promedio truncado izquierdo",
    descripcionTeorica:
      "El promedio truncado izquierdo E[X | X ≤ x] es la media condicional de X " +
      "dado que X ≤ x. Para la uniforme resulta el punto medio del intervalo [a, x], " +
      "ya que la densidad es constante en ese subintervalo.",
    formulaGeneral:
      "E[X \\mid X \\leq x] = \\frac{H_{UNI}(x/a;b)}{F_{UNI}(x/a;b)} = \\frac{a + x}{2}",
    calcular({ params: { a, b }, x }: EntradaX<ParamsUniforme>) {
      if (x <= a) return -Infinity
      if (x >= b) return (a + b) / 2
      return (a + x) / 2
    },
    formulaConValores(
      { params: { a, b }, x }: EntradaX<ParamsUniforme>,
      resultado: number
    ) {
      const H = hIzq(Math.min(x, b), a, b)
      const F = (Math.min(x, b) - a) / (b - a)
      return (
        `E[X \\mid X \\leq ${numeroLatex(x)}] = ` +
        `\\frac{H_{UNI}}{F_{UNI}} = \\frac{${numeroLatex(H)}}{${numeroLatex(F)}} = ` +
        `\\frac{${numeroLatex(a)} + ${numeroLatex(x)}}{2} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 8. Promedio truncado derecho ───────────────────────────

  promedioTruncadoDerecho: {
    titulo: "Promedio truncado derecho",
    descripcionTeorica:
      "El promedio truncado derecho E[X | X > x] es la media condicional de X " +
      "dado que X > x. Para la uniforme resulta el punto medio del intervalo [x, b], " +
      "ya que la densidad es constante en ese subintervalo.",
    formulaGeneral:
      "E[X \\mid X > x] = \\frac{J_{UNI}(x/a;b)}{G_{UNI}(x/a;b)} = \\frac{x + b}{2}",
    calcular({ params: { a, b }, x }: EntradaX<ParamsUniforme>) {
      if (x >= b) return Infinity
      if (x <= a) return (a + b) / 2
      return (x + b) / 2
    },
    formulaConValores(
      { params: { a, b }, x }: EntradaX<ParamsUniforme>,
      resultado: number
    ) {
      const J = hDer(Math.max(x, a), a, b)
      const G = (b - Math.max(x, a)) / (b - a)
      return (
        `E[X \\mid X > ${numeroLatex(x)}] = ` +
        `\\frac{J_{UNI}}{G_{UNI}} = \\frac{${numeroLatex(J)}}{${numeroLatex(G)}} = ` +
        `\\frac{${numeroLatex(x)} + ${numeroLatex(b)}}{2} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 9. Promedio truncado a dos colas ───────────────────────

  promedioTruncadoDosColas: {
    titulo: "Promedio truncado a dos colas",
    descripcionTeorica:
      "El promedio truncado a dos colas E[X | c ≤ X ≤ d] es la media condicional de X " +
      "en el intervalo [c, d] ⊆ [a, b]. Para la uniforme resulta el punto medio (c+d)/2, " +
      "ya que la densidad es constante en cualquier subintervalo.",
    formulaGeneral:
      "E[X \\mid c \\leq X \\leq d] = \\frac{H_{UNI}(d) - H_{UNI}(c)}{F_{UNI}(d) - F_{UNI}(c)} = \\frac{c + d}{2}",
    calcular({
      params: { a, b },
      a: c,
      b: d,
    }: EntradaDosColas<ParamsUniforme>) {
      const cc = Math.max(a, c)
      const dd = Math.min(b, d)
      if (cc >= dd) return NaN
      return (cc + dd) / 2
    },
    formulaConValores(
      { params: { a, b }, a: c, b: d }: EntradaDosColas<ParamsUniforme>,
      resultado: number
    ) {
      const cc = Math.max(a, c)
      const dd = Math.min(b, d)
      const Hc = hIzq(cc, a, b)
      const Hd = hIzq(dd, a, b)
      const Fc = (cc - a) / (b - a)
      const Fd = (dd - a) / (b - a)
      return (
        `E[X \\mid ${numeroLatex(c)} \\leq X \\leq ${numeroLatex(d)}] = ` +
        `\\frac{H_{UNI}(${numeroLatex(dd)}) - H_{UNI}(${numeroLatex(cc)})}{F_{UNI}(${numeroLatex(dd)}) - F_{UNI}(${numeroLatex(cc)})} = ` +
        `\\frac{${numeroLatex(Hd)} - ${numeroLatex(Hc)}}{${numeroLatex(Fd)} - ${numeroLatex(Fc)}} = ` +
        `\\frac{${numeroLatex(cc)} + ${numeroLatex(dd)}}{2} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 10. Probabilidad del intervalo ─────────────────────────

  probabilidadIntervalo: {
    titulo: "Probabilidad del intervalo \n P(c ≤ X ≤ d)",
    descripcionTeorica:
      "La probabilidad de que X caiga en el intervalo [c, d] se obtiene " +
      "como la diferencia de acumuladas: F_UNI(d) − F_UNI(c). " +
      "Para la uniforme equivale a la longitud relativa del subintervalo respecto a (b−a).",
    formulaGeneral:
      "P(c \\leq X \\leq d) = F_{UNI}(d) - F_{UNI}(c) = \\frac{d' - c'}{b - a}",
    calcular({
      params: { a, b },
      a: c,
      b: d,
    }: EntradaDosColas<ParamsUniforme>) {
      const cc = Math.max(a, c)
      const dd = Math.min(b, d)
      if (cc >= dd) return 0
      return (dd - cc) / (b - a)
    },
    formulaConValores(
      { params: { a, b }, a: c, b: d }: EntradaDosColas<ParamsUniforme>,
      resultado: number
    ) {
      const cc = Math.max(a, c)
      const dd = Math.min(b, d)
      const Fc = (cc - a) / (b - a)
      const Fd = (dd - a) / (b - a)
      return (
        `P(${numeroLatex(c)} \\leq X \\leq ${numeroLatex(d)}) = ` +
        `F_{UNI}(${numeroLatex(dd)}) - F_{UNI}(${numeroLatex(cc)}) = ` +
        `${numeroLatex(Fd)} - ${numeroLatex(Fc)} = ${numeroLatex(resultado)}`
      )
    },
  },
}
