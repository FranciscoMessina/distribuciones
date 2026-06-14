// ============================================================
// Distribución Pareto  X ~ Pareto(θ, b)
// Parámetros: θ > 0 (mínimo/escala), b > 0 (forma/índice)
// Soporte: x ∈ [θ, +∞)
//
// G_p(x|θ;b) = (θ/x)^b  (acumulada derecha)
// E[X] = b·θ/(b−1)  para b > 1
// ============================================================

import type {
  DistribucionSpec,
  EntradaDosColas,
  EntradaP,
  EntradaX,
} from "./tipos"
import { numeroLatex } from "./formato"

export type ParamsPareto = { theta: number; b: number }

function mediaPareto({ theta, b }: ParamsPareto): number {
  if (b <= 1) return Infinity
  return (b * theta) / (b - 1)
}

function varianzaPareto({ theta, b }: ParamsPareto): number {
  if (b <= 2) return Infinity
  return (b * theta * theta) / ((b - 1) ** 2 * (b - 2))
}

function Hp(x: number, params: ParamsPareto): number {
  const { theta, b } = params
  if (b <= 1) return Infinity
  if (x <= theta) return 0
  return ((b * theta) / (b - 1)) * (1 - Math.pow(theta / x, b - 1))
}

export function modaPareto({ theta }: ParamsPareto): number {
  return theta
}

export function medianaPareto({ theta, b }: ParamsPareto): number {
  return theta * 2 ** (1 / b)
}

export const DistribucionPareto: DistribucionSpec<ParamsPareto> = {
  slug: "pareto",
  nombre: "Pareto",
  descripcion:
    "La distribución Pareto modela fenómenos con colas pesadas (ley de potencias). " +
    "El parámetro b controla el grosor de la cola: menor b implica cola más pesada. " +
    "θ es el valor mínimo posible de la variable.",

  parametros: [
    { clave: "theta", simbolo: "θ", etiqueta: "Mínimo (θ) (Moda) ", min: 0 },
    { clave: "b", simbolo: "b", etiqueta: "Forma (b)", min: 0 },
  ],

  // ── Primitivas ────────────────────────────────────────────

  pdf(x, { theta, b }) {
    if (x < theta) return 0
    return (b / x) * (theta / x) ** b
  },

  cdf(x, { theta, b }) {
    if (x < theta) return 0
    return 1 - (theta / x) ** b
  },

  cuantil(p, { theta, b }) {
    return theta / (1 - p) ** (1 / b)
  },

  // ── Esperanza matemática ──────────────────────────────────

  esperanza: {
    titulo: "Esperanza matemática \n E(X) = μ",
    descripcionTeorica:
      "La esperanza matemática E[X] de la Pareto existe sólo cuando b > 1. " +
      "Para b ≤ 1 la media diverge, lo que refleja la extrema pesadez de la cola.",
    formulaGeneral:
      "E(X) = \\mu = \\frac{b \\cdot \\theta}{b - 1}, \\quad b > 1",
    calcular(params: ParamsPareto) {
      return mediaPareto(params)
    },
    formulaConValores({ theta, b }: ParamsPareto, resultado: number) {
      return `E(X) = \\frac{${numeroLatex(b)} \\cdot ${numeroLatex(theta)}}{${numeroLatex(b)} - 1} = ${numeroLatex(resultado)}`
    },
  },

  desvio: {
    titulo: "Desvío estándar \n σ",
    descripcionTeorica:
      "El desvío estándar σ se obtiene como raíz de la varianza V[X] = b·θ²/((b−1)²·(b−2)). " +
      "Existe sólo cuando b > 2; para b ≤ 2 la varianza diverge.",
    formulaGeneral:
      "\\sigma = \\sqrt{\\frac{b \\cdot \\theta^2}{(b-1)^2 \\cdot (b-2)}}, \\quad b > 2",
    calcular(params: ParamsPareto) {
      return Math.sqrt(varianzaPareto(params))
    },
    formulaConValores(params: ParamsPareto, resultado: number) {
      const { theta, b } = params
      const v = varianzaPareto(params)
      return `\\sigma = \\sqrt{\\frac{${numeroLatex(b)} \\cdot ${numeroLatex(theta)}^2}{(${numeroLatex(b)}-1)^2 \\cdot (${numeroLatex(b)}-2)}} = \\sqrt{${numeroLatex(v)}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 1. Probabilidad acumulada izquierda ──────────────────

  probabilidadAcumuladaIzquierda: {
    titulo: "Probabilidad acumulada izquierda \n P(X ≤ x) o F(X)",
    descripcionTeorica:
      "La probabilidad acumulada izquierda F_p(x|θ;b) = 1 − (θ/x)^b para x ≥ θ. " +
      "Es el complemento de la función de supervivencia de Pareto.",
    formulaGeneral:
      "F_{p}(x|\\theta;b) = 1 - \\left(\\frac{\\theta}{x}\\right)^b, \\quad x \\geq \\theta",
    calcular({ params: { theta, b }, x }: EntradaX<ParamsPareto>) {
      if (x < theta) return 0
      return 1 - (theta / x) ** b
    },
    formulaConValores(
      { params: { theta, b }, x }: EntradaX<ParamsPareto>,
      resultado: number
    ) {
      return (
        `F_{p}(${numeroLatex(x)}|${numeroLatex(theta)};${numeroLatex(b)}) = ` +
        `1 - \\left(\\frac{${numeroLatex(theta)}}{${numeroLatex(x)}}\\right)^{${numeroLatex(b)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 2. Probabilidad acumulada derecha ────────────────────

  probabilidadAcumuladaDerecha: {
    titulo: "Probabilidad acumulada derecha \n P(X ≥ x) o G(x)",
    descripcionTeorica:
      "La función de supervivencia G_p(x|θ;b) = (θ/x)^b tiene forma de ley de potencias, " +
      "lo que caracteriza la cola pesada de la distribución Pareto.",
    formulaGeneral:
      "G_{p}(x|\\theta;b) = \\left(\\frac{\\theta}{x}\\right)^b, \\quad x \\geq \\theta",
    calcular({ params: { theta, b }, x }: EntradaX<ParamsPareto>) {
      if (x < theta) return 1
      return (theta / x) ** b
    },
    formulaConValores(
      { params: { theta, b }, x }: EntradaX<ParamsPareto>,
      resultado: number
    ) {
      return (
        `G_{p}(${numeroLatex(x)}|${numeroLatex(theta)};${numeroLatex(b)}) = ` +
        `\\left(\\frac{${numeroLatex(theta)}}{${numeroLatex(x)}}\\right)^{${numeroLatex(b)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 3. Valor dado probabilidad izquierda ─────────────────

  valorDadaProbabilidadIzquierda: {
    titulo: "Valor dado probabilidad izquierda",
    descripcionTeorica:
      "El fractil x_(α) es el valor tal que P(X ≤ x) = α. " +
      "Se invierte la CDF: x = θ / (1−α)^(1/b).",
    formulaGeneral: "x_{(\\alpha)} = \\frac{\\theta}{(1 - \\alpha)^{1/b}}",
    calcular({ params: { theta, b }, p }: EntradaP<ParamsPareto>) {
      return theta / Math.pow(1 - p, 1 / b)
    },
    formulaConValores(
      { params: { theta, b }, p }: EntradaP<ParamsPareto>,
      resultado: number
    ) {
      return `x_{(${numeroLatex(p)})} = \\frac{${numeroLatex(theta)}}{(1 - ${numeroLatex(p)})^{1/${numeroLatex(b)}}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 4. Valor dado probabilidad derecha ───────────────────

  valorDadaProbabilidadDerecha: {
    titulo: "Valor dado probabilidad derecha",
    descripcionTeorica:
      "El cuantil tal que P(X ≥ x) = α equivale a P(X ≤ x) = 1 − α. " +
      "Aplicando la fórmula del fractil con la probabilidad α directamente: x = θ / α^(1/b).",
    formulaGeneral: "x = \\frac{\\theta}{\\alpha^{1/b}}",
    calcular({ params: { theta, b }, p }: EntradaP<ParamsPareto>) {
      return theta / Math.pow(p, 1 / b)
    },
    formulaConValores(
      { params: { theta, b }, p }: EntradaP<ParamsPareto>,
      resultado: number
    ) {
      return `x = \\frac{${numeroLatex(theta)}}{${numeroLatex(p)}^{1/${numeroLatex(b)}}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 5. Expectativa parcial izquierda ─────────────────────

  expectativaParcialIzquierda: {
    titulo: "Expectativa parcial izquierda \n H(x)",
    descripcionTeorica:
      "La expectativa parcial izquierda H_p(x|θ;b) = ∫_θ^x t·f(t)dt existe para b > 1 " +
      "y representa la contribución al valor esperado de los valores menores o iguales a x.",
    formulaGeneral:
      "H_{p}(x|\\theta;b) = \\frac{b \\cdot \\theta}{b - 1} \\cdot \\left[ 1 - \\left(\\frac{\\theta}{x}\\right)^{b-1} \\right]",
    calcular({ params, x }: EntradaX<ParamsPareto>) {
      const { theta } = params
      if (x <= theta) return 0
      return Hp(x, params)
    },
    formulaConValores(
      { params: { theta, b }, x }: EntradaX<ParamsPareto>,
      resultado: number
    ) {
      const mu = (b * theta) / (b - 1)
      const ratio = Math.pow(theta / x, b - 1)
      return (
        `H_{p}(${numeroLatex(x)}|${numeroLatex(theta)};${numeroLatex(b)}) = ` +
        `\\frac{${numeroLatex(b)} \\cdot ${numeroLatex(theta)}}{${numeroLatex(b)} - 1} \\cdot \\left[1 - \\left(\\frac{${numeroLatex(theta)}}{${numeroLatex(x)}}\\right)^{${numeroLatex(b)}-1}\\right] = ` +
        `${numeroLatex(mu)} \\cdot (1 - ${numeroLatex(ratio)}) = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 6. Expectativa parcial derecha ───────────────────────

  expectativaParcialDerecha: {
    titulo: "Expectativa parcial derecha \n J(x)",
    descripcionTeorica:
      "La expectativa parcial derecha J_p(x|θ;b) = ∫_x^∞ t·f(t)dt se obtiene como " +
      "complemento de H: J = E[X] − H_p(x). La suma H + J = E[X] = b·θ/(b−1).",
    formulaGeneral:
      "J_{p}(x|\\theta;b) = \\frac{b \\cdot \\theta}{b - 1} \\cdot \\left(\\frac{\\theta}{x}\\right)^{b-1}",
    calcular({ params, x }: EntradaX<ParamsPareto>) {
      const { theta, b } = params
      if (b <= 1) return Infinity
      if (x <= theta) return mediaPareto(params)
      return ((b * theta) / (b - 1)) * Math.pow(theta / x, b - 1)
    },
    formulaConValores(
      { params: { theta, b }, x }: EntradaX<ParamsPareto>,
      resultado: number
    ) {
      const mu = (b * theta) / (b - 1)
      const ratio = Math.pow(theta / x, b - 1)
      return (
        `J_{p}(${numeroLatex(x)}|${numeroLatex(theta)};${numeroLatex(b)}) = ` +
        `\\frac{${numeroLatex(b)} \\cdot ${numeroLatex(theta)}}{${numeroLatex(b)} - 1} \\cdot \\left(\\frac{${numeroLatex(theta)}}{${numeroLatex(x)}}\\right)^{${numeroLatex(b)}-1} = ` +
        `${numeroLatex(mu)} \\cdot ${numeroLatex(ratio)} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 7. Promedio truncado izquierdo ───────────────────────

  promedioTruncadoIzquierdo: {
    titulo: "Promedio truncado izquierdo",
    descripcionTeorica:
      "El promedio truncado izquierdo E[X | X ≤ x] es la media condicional de X " +
      "dado que X ≤ x. Se obtiene dividiendo la expectativa parcial H_p por F_p.",
    formulaGeneral:
      "E[X \\mid X \\leq x] = \\frac{H_{p}(x|\\theta;b)}{F_{p}(x|\\theta;b)}",
    calcular({ params, x }: EntradaX<ParamsPareto>) {
      const { theta, b } = params
      if (b <= 1) return Infinity
      if (x <= theta) return NaN
      const F = 1 - Math.pow(theta / x, b)
      if (F === 0) return NaN
      return Hp(x, params) / F
    },
    formulaConValores(
      { params, x }: EntradaX<ParamsPareto>,
      resultado: number
    ) {
      const { theta, b } = params
      const Hx = Hp(x, params)
      const F = 1 - Math.pow(theta / x, b)
      return (
        `E[X \\mid X \\leq ${numeroLatex(x)}] = ` +
        `\\frac{H_{p}}{F_{p}} = \\frac{${numeroLatex(Hx)}}{${numeroLatex(F)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 8. Promedio truncado derecho ─────────────────────────

  promedioTruncadoDerecho: {
    titulo: "Promedio truncado derecho",
    descripcionTeorica:
      "El promedio truncado derecho E[X | X > x] para la Pareto se simplifica a b·x/(b−1), " +
      "resultado notable que es independiente de θ.",
    formulaGeneral:
      "E[X \\mid X > x] = \\frac{J_{p}(x|\\theta;b)}{G_{p}(x|\\theta;b)} = \\frac{b \\cdot x}{b - 1}",
    calcular({ params: { b }, x }: EntradaX<ParamsPareto>) {
      if (b <= 1) return Infinity
      return (b * x) / (b - 1)
    },
    formulaConValores(
      { params: { b }, x }: EntradaX<ParamsPareto>,
      resultado: number
    ) {
      return `E[X \\mid X > ${numeroLatex(x)}] = \\frac{${numeroLatex(b)} \\cdot ${numeroLatex(x)}}{${numeroLatex(b)} - 1} = ${numeroLatex(resultado)}`
    },
  },

  // ── 9. Promedio truncado a dos colas ─────────────────────

  promedioTruncadoDosColas: {
    titulo: "Promedio truncado a dos colas",
    descripcionTeorica:
      "El promedio truncado a dos colas E[X | x₁ ≤ X ≤ x₂] es la media condicional " +
      "de X en el intervalo [x₁, x₂]. Se calcula como la diferencia de expectativas " +
      "parciales H_p dividida por la probabilidad del intervalo.",
    formulaGeneral:
      "E[X \\mid x_1 \\leq X \\leq x_2] = \\frac{H_{p}(x_2|\\theta;b) - H_{p}(x_1|\\theta;b)}{F_{p}(x_2|\\theta;b) - F_{p}(x_1|\\theta;b)}",
    calcular({ params, a, b: bLim }: EntradaDosColas<ParamsPareto>) {
      const { theta, b } = params
      if (b <= 1) return Infinity
      const aEff = Math.max(a, theta)
      const bEff = Math.max(bLim, theta)
      const Fa = 1 - Math.pow(theta / aEff, b)
      const Fb = 1 - Math.pow(theta / bEff, b)
      const denom = Fb - Fa
      if (denom === 0) return NaN
      return (Hp(bEff, params) - Hp(aEff, params)) / denom
    },
    formulaConValores(
      { params, a, b: bLim }: EntradaDosColas<ParamsPareto>,
      resultado: number
    ) {
      const { theta, b } = params
      const aEff = Math.max(a, theta)
      const bEff = Math.max(bLim, theta)
      const Ha = Hp(aEff, params)
      const Hb = Hp(bEff, params)
      const Fa = 1 - Math.pow(theta / aEff, b)
      const Fb = 1 - Math.pow(theta / bEff, b)
      return (
        `E[X \\mid ${numeroLatex(a)} \\leq X \\leq ${numeroLatex(bLim)}] = ` +
        `\\frac{H_{p}(${numeroLatex(bLim)}) - H_{p}(${numeroLatex(a)})}{F_{p}(${numeroLatex(bLim)}) - F_{p}(${numeroLatex(a)})} = ` +
        `\\frac{${numeroLatex(Hb)} - ${numeroLatex(Ha)}}{${numeroLatex(Fb)} - ${numeroLatex(Fa)}} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── Probabilidad del intervalo ────────────────────────────

  probabilidadIntervalo: {
    titulo: "Probabilidad del intervalo \n P(x₁ ≤ X ≤ x₂)",
    descripcionTeorica:
      "La probabilidad de que X caiga en [x₁, x₂] se obtiene como la diferencia de acumuladas: " +
      "F_p(x₂) − F_p(x₁) = (θ/x₁)^b − (θ/x₂)^b.",
    formulaGeneral:
      "P(x_1 \\leq X \\leq x_2) = \\left(\\frac{\\theta}{x_1}\\right)^b - \\left(\\frac{\\theta}{x_2}\\right)^b",
    calcular({
      params: { theta, b },
      a,
      b: bLim,
    }: EntradaDosColas<ParamsPareto>) {
      const Fa = a >= theta ? 1 - Math.pow(theta / a, b) : 0
      const Fb = bLim >= theta ? 1 - Math.pow(theta / bLim, b) : 0
      return Fb - Fa
    },
    formulaConValores(
      { params: { theta, b }, a, b: bLim }: EntradaDosColas<ParamsPareto>,
      resultado: number
    ) {
      const Fa = a >= theta ? 1 - Math.pow(theta / a, b) : 0
      const Fb = bLim >= theta ? 1 - Math.pow(theta / bLim, b) : 0
      return (
        `P(${numeroLatex(a)} \\leq X \\leq ${numeroLatex(bLim)}) = ` +
        `F_{p}(${numeroLatex(bLim)}) - F_{p}(${numeroLatex(a)}) = ` +
        `${numeroLatex(Fb)} - ${numeroLatex(Fa)} = ${numeroLatex(resultado)}`
      )
    },
  },

  derivacionesDeParametros: [
    {
      etiquetaBoton: "Moda y mediana",
      inputs: [
        { etiqueta: "Moda (Mo = θ)", placeholder: "Mo", min: 0 },
        { etiqueta: "Mediana (Me)", placeholder: "Me", min: 0 },
      ],
      derivar([mo, me]) {
        // Mo = θ  →  θ = Mo
        // Me = θ · 2^(1/b)  →  b = ln(2) / ln(Me/θ)
        // Requires Me > Mo (median always exceeds mode for Pareto)
        if (me <= mo) return null
        const thetaVal = mo
        const bVal = Math.log(2) / Math.log(me / mo)
        return {
          params: { theta: thetaVal, b: bVal },
          pasos: [
            {
              general: "\\theta = Mo",
              conValores: `\\theta = ${numeroLatex(thetaVal)}`,
            },
            {
              general: "b = \\frac{\\ln 2}{\\ln(Me / \\theta)}",
              conValores: `b = \\frac{\\ln 2}{\\ln(${numeroLatex(me)} / ${numeroLatex(mo)})} = ${numeroLatex(bVal)}`,
            },
          ],
        }
      },
    },
  ],
}
