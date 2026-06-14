// ============================================================
// Distribución Weibull  X ~ Weibull(β, ω)
// Parámetros: β > 0 (escala / vida característica), ω > 0 (forma)
// Soporte: x ∈ [0, +∞)
//
// G_W(x) = e^{-(x/β)^ω}   (acumulada derecha)
// H_W(x) = β·Γ(1+1/ω)·P(1+1/ω, (x/β)^ω)  (expectativa parcial izq.)
// ============================================================

import type {
  DistribucionSpec,
  EntradaDosColas,
  EntradaP,
  EntradaX,
} from "./tipos"
import { gamma, gammainc, cuantilPorBiseccion } from "./matematica"
import { numeroLatex } from "./formato"

export type ParamsWeibull = { beta: number; omega: number }

// ── Helpers internos ─────────────────────────────────────────

/** Γ(1 + k/ω) */
function Gk(k: number, omega: number): number {
  return gamma(1 + k / omega)
}

function mediaWeibull({ beta, omega }: ParamsWeibull): number {
  return beta * Gk(1, omega)
}

function varianzaWeibull({ beta, omega }: ParamsWeibull): number {
  return beta * beta * (Gk(2, omega) - Gk(1, omega) ** 2)
}

/** H_W(x) = β · Γ(1+1/ω) · P(1+1/ω, (x/β)^ω) */
function Hw(x: number, { beta, omega }: ParamsWeibull): number {
  if (x <= 0) return 0
  const a = 1 + 1 / omega
  const u = Math.pow(x / beta, omega)
  return beta * Gk(1, omega) * gammainc(a, u)
}

export function modaWeibull({ beta, omega }: ParamsWeibull): number {
  if (omega <= 1) return 0
  return beta * Math.pow(1 - 1 / omega, 1 / omega)
}

export function medianaWeibull({ beta, omega }: ParamsWeibull): number {
  return beta * Math.pow(Math.LN2, 1 / omega)
}

// ── Spec ─────────────────────────────────────────────────────

export const DistribucionWeibull: DistribucionSpec<ParamsWeibull> = {
  slug: "weibull",
  nombre: "Weibull",
  descripcion:
    "La distribución Weibull modela tiempos de vida y fallas con gran flexibilidad. " +
    "El parámetro de forma ω controla la tasa de fallo: decreciente (ω < 1), " +
    "constante (ω = 1, exponencial) o creciente (ω > 1). " +
    "β es la vida característica (escala).",

  parametros: [
    {
      clave: "beta",
      simbolo: "β",
      etiqueta: "Escala (β)",
      min: 0,
    },
    { clave: "omega", simbolo: "ω", etiqueta: "Forma (ω)", min: 0 },
  ],

  // ── Primitivas ────────────────────────────────────────────

  pdf(x, { beta, omega }) {
    if (x < 0) return 0
    if (x === 0) return omega < 1 ? Infinity : omega === 1 ? 1 / beta : 0
    return (
      omega *
      Math.pow(1 / beta, omega) *
      Math.pow(x, omega - 1) *
      Math.exp(-Math.pow(x / beta, omega))
    )
  },

  cdf(x, { beta, omega }) {
    if (x <= 0) return 0
    return 1 - Math.exp(-Math.pow(x / beta, omega))
  },

  cuantil(p, { beta, omega }) {
    return beta * Math.pow(-Math.log(1 - p), 1 / omega)
  },

  // ── Esperanza y desvío ────────────────────────────────────

  esperanza: {
    titulo: "Esperanza matemática \n E(X) = μ = MTTF",
    descripcionTeorica:
      "La esperanza de la Weibull es E[X] = β · Γ(1+1/ω), " +
      "donde Γ es la función gamma de Euler. " +
      "En confiabilidad se la llama MTTF (tiempo medio hasta falla).",
    formulaGeneral:
      "E(X) = \\mu = \\beta \\cdot \\Gamma_{\\left(1+\\frac{1}{\\omega}\\right)}",
    calcular({ beta, omega }: ParamsWeibull) {
      return mediaWeibull({ beta, omega })
    },
    formulaConValores({ beta, omega }: ParamsWeibull, resultado: number) {
      const g1 = Gk(1, omega)
      return (
        `E(X) = ${numeroLatex(beta)} \\cdot \\Gamma_{\\left(1+\\frac{1}{${numeroLatex(omega)}}\\right)} = ` +
        `${numeroLatex(beta)} \\cdot ${numeroLatex(g1)} = ${numeroLatex(resultado)}`
      )
    },
  },

  desvio: {
    titulo: "Desvío estándar \n σ",
    descripcionTeorica:
      "La varianza de la Weibull es σ² = β²·[Γ(1+2/ω) − Γ(1+1/ω)²]. " +
      "El desvío σ es su raíz cuadrada.",
    formulaGeneral:
      "\\sigma = \\sqrt{\\beta^2 \\cdot \\left[\\Gamma_{\\left(1+\\frac{2}{\\omega}\\right)} - \\Gamma_{\\left(1+\\frac{1}{\\omega}\\right)}^2\\right]}",
    calcular({ beta, omega }: ParamsWeibull) {
      return Math.sqrt(varianzaWeibull({ beta, omega }))
    },
    formulaConValores({ beta, omega }: ParamsWeibull, resultado: number) {
      const g1 = Gk(1, omega)
      const g2 = Gk(2, omega)
      const v = varianzaWeibull({ beta, omega })
      return (
        `\\sigma = \\sqrt{${numeroLatex(beta)}^2 \\cdot \\left[${numeroLatex(g2)} - ${numeroLatex(g1)}^2\\right]} = ` +
        `\\sqrt{${numeroLatex(v)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 1. Probabilidad acumulada izquierda ──────────────────

  probabilidadAcumuladaIzquierda: {
    titulo: "Probabilidad acumulada izquierda \n P(X ≤ x) o F(x)",
    descripcionTeorica:
      "F_W(x|β;ω) = 1 − e^{−(x/β)^ω} para x ≥ 0. " +
      "Es el complemento de la función de supervivencia de Weibull.",
    formulaGeneral:
      "F_{W}(x|\\beta;\\omega) = 1 - e^{-\\left(\\frac{x}{\\beta}\\right)^{\\omega}}",
    calcular({ params: { beta, omega }, x }: EntradaX<ParamsWeibull>) {
      if (x <= 0) return 0
      return 1 - Math.exp(-Math.pow(x / beta, omega))
    },
    formulaConValores(
      { params: { beta, omega }, x }: EntradaX<ParamsWeibull>,
      resultado: number
    ) {
      return (
        `F_{W}(${numeroLatex(x)}|${numeroLatex(beta)};${numeroLatex(omega)}) = ` +
        `1 - e^{-\\left(\\frac{${numeroLatex(x)}}{${numeroLatex(beta)}}\\right)^{${numeroLatex(omega)}}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 2. Probabilidad acumulada derecha ────────────────────

  probabilidadAcumuladaDerecha: {
    titulo: "Probabilidad acumulada derecha \n P(X ≥ x) o G(x)",
    descripcionTeorica:
      "La función de supervivencia G_W(x|β;ω) = e^{−(x/β)^ω} mide " +
      "la probabilidad de que el sistema siga en funcionamiento más allá de x.",
    formulaGeneral:
      "G_{W}(x|\\beta;\\omega) = e^{-\\left(\\frac{x}{\\beta}\\right)^{\\omega}}",
    calcular({ params: { beta, omega }, x }: EntradaX<ParamsWeibull>) {
      if (x <= 0) return 1
      return Math.exp(-Math.pow(x / beta, omega))
    },
    formulaConValores(
      { params: { beta, omega }, x }: EntradaX<ParamsWeibull>,
      resultado: number
    ) {
      return (
        `G_{W}(${numeroLatex(x)}|${numeroLatex(beta)};${numeroLatex(omega)}) = ` +
        `e^{-\\left(\\frac{${numeroLatex(x)}}{${numeroLatex(beta)}}\\right)^{${numeroLatex(omega)}}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 3. Valor dado probabilidad izquierda ─────────────────

  valorDadaProbabilidadIzquierda: {
    titulo: "Valor dado probabilidad izquierda \n Fractil x_(α)",
    descripcionTeorica:
      "El fractil x_(α) es el valor tal que P(X ≤ x) = α. " +
      "Invirtiendo la CDF: x = β · (−ln(1−α))^(1/ω).",
    formulaGeneral:
      "x_{(\\alpha)} = \\beta \\cdot (-\\ln(1-\\alpha))^{\\frac{1}{\\omega}}",
    calcular({ params: { beta, omega }, p }: EntradaP<ParamsWeibull>) {
      return beta * Math.pow(-Math.log(1 - p), 1 / omega)
    },
    formulaConValores(
      { params: { beta, omega }, p }: EntradaP<ParamsWeibull>,
      resultado: number
    ) {
      return `x_{(${numeroLatex(p)})} = ${numeroLatex(beta)} \\cdot (-\\ln(1-${numeroLatex(p)}))^{\\frac{1}{${numeroLatex(omega)}}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 4. Valor dado probabilidad derecha ───────────────────

  valorDadaProbabilidadDerecha: {
    titulo: "Valor dado probabilidad derecha",
    descripcionTeorica:
      "El valor x tal que P(X ≥ x) = α equivale al fractil de nivel 1−α: " +
      "x = β · (−ln α)^(1/ω).",
    formulaGeneral: "x = \\beta \\cdot (-\\ln \\alpha)^{\\frac{1}{\\omega}}",
    calcular({ params: { beta, omega }, p }: EntradaP<ParamsWeibull>) {
      return beta * Math.pow(-Math.log(p), 1 / omega)
    },
    formulaConValores(
      { params: { beta, omega }, p }: EntradaP<ParamsWeibull>,
      resultado: number
    ) {
      return `x = ${numeroLatex(beta)} \\cdot (-\\ln ${numeroLatex(p)})^{\\frac{1}{${numeroLatex(omega)}}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 5. Expectativa parcial izquierda ─────────────────────

  expectativaParcialIzquierda: {
    titulo: "Expectativa parcial izquierda \n H(x)",
    descripcionTeorica:
      "H_W(x|β;ω) = β·Γ(1+1/ω)·F_γ((x/β)^ω | 1+1/ω; 1) " +
      "donde F_γ es la CDF acumulada izquierda del modelo Gamma " +
      "evaluada en la gamma incompleta regularizada P(1+1/ω, (x/β)^ω).",
    formulaGeneral:
      "H_{W}(x|\\beta;\\omega) = \\beta \\cdot \\Gamma_{\\left(1+\\frac{1}{\\omega}\\right)} \\cdot F_{\\gamma}\\!\\left(\\left(\\frac{x}{\\beta}\\right)^{\\!\\omega} \\,\\Big|\\, 1+\\frac{1}{\\omega};\\,1\\right)",
    calcular({ params, x }: EntradaX<ParamsWeibull>) {
      return Hw(x, params)
    },
    formulaConValores(
      { params: { beta, omega }, x }: EntradaX<ParamsWeibull>,
      resultado: number
    ) {
      const g1 = Gk(1, omega)
      const a = 1 + 1 / omega
      const u = Math.pow(x / beta, omega)
      const Fg = gammainc(a, u)
      return (
        `H_{W}(${numeroLatex(x)}|${numeroLatex(beta)};${numeroLatex(omega)}) = ` +
        `${numeroLatex(beta)} \\cdot ${numeroLatex(g1)} \\cdot ${numeroLatex(Fg)} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 6. Expectativa parcial derecha ───────────────────────

  expectativaParcialDerecha: {
    titulo: "Expectativa parcial derecha \n J(x)",
    descripcionTeorica:
      "J_W(x) = E[X] − H_W(x). " +
      "La suma H(x) + J(x) = E[X] = β·Γ(1+1/ω) para todo x.",
    formulaGeneral:
      "J_{W}(x|\\beta;\\omega) = \\beta \\cdot \\Gamma_{\\left(1+\\frac{1}{\\omega}\\right)} \\cdot \\left[1 - F_{\\gamma}\\!\\left(\\left(\\frac{x}{\\beta}\\right)^{\\!\\omega}\\right)\\right]",
    calcular({ params, x }: EntradaX<ParamsWeibull>) {
      return mediaWeibull(params) - Hw(x, params)
    },
    formulaConValores(
      { params, x }: EntradaX<ParamsWeibull>,
      resultado: number
    ) {
      const mu = mediaWeibull(params)
      const hw = Hw(x, params)
      return (
        `J_{W}(${numeroLatex(x)}) = E(X) - H_{W}(${numeroLatex(x)}) = ` +
        `${numeroLatex(mu)} - ${numeroLatex(hw)} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 7. Promedio truncado izquierdo ───────────────────────

  promedioTruncadoIzquierdo: {
    titulo: "Promedio truncado izquierdo",
    descripcionTeorica:
      "E[X | X ≤ x] es la media condicional de X dado que X ≤ x. " +
      "Se obtiene dividiendo la expectativa parcial H_W por la probabilidad F_W.",
    formulaGeneral:
      "E[X \\mid X \\leq x] = \\frac{H_{W}(x|\\beta;\\omega)}{F_{W}(x|\\beta;\\omega)}",
    calcular({ params, x }: EntradaX<ParamsWeibull>) {
      if (x <= 0) return NaN
      const F = 1 - Math.exp(-Math.pow(x / params.beta, params.omega))
      if (F === 0) return NaN
      return Hw(x, params) / F
    },
    formulaConValores(
      { params, x }: EntradaX<ParamsWeibull>,
      resultado: number
    ) {
      const { beta, omega } = params
      const hw = Hw(x, params)
      const F = 1 - Math.exp(-Math.pow(x / beta, omega))
      return (
        `E[X \\mid X \\leq ${numeroLatex(x)}] = ` +
        `\\frac{H_{W}}{F_{W}} = \\frac{${numeroLatex(hw)}}{${numeroLatex(F)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 8. Promedio truncado derecho ─────────────────────────

  promedioTruncadoDerecho: {
    titulo: "Promedio truncado derecho",
    descripcionTeorica:
      "E[X | X > x] es la media condicional de X dado que X > x. " +
      "Se obtiene dividiendo la expectativa parcial derecha J_W por la supervivencia G_W.",
    formulaGeneral:
      "E[X \\mid X > x] = \\frac{J_{W}(x|\\beta;\\omega)}{G_{W}(x|\\beta;\\omega)}",
    calcular({ params, x }: EntradaX<ParamsWeibull>) {
      if (x <= 0) return mediaWeibull(params)
      const G = Math.exp(-Math.pow(x / params.beta, params.omega))
      if (G === 0) return NaN
      return (mediaWeibull(params) - Hw(x, params)) / G
    },
    formulaConValores(
      { params, x }: EntradaX<ParamsWeibull>,
      resultado: number
    ) {
      const { beta, omega } = params
      const jw = mediaWeibull(params) - Hw(x, params)
      const G = Math.exp(-Math.pow(x / beta, omega))
      return (
        `E[X \\mid X > ${numeroLatex(x)}] = ` +
        `\\frac{J_{W}}{G_{W}} = \\frac{${numeroLatex(jw)}}{${numeroLatex(G)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 9. Promedio truncado a dos colas ─────────────────────

  promedioTruncadoDosColas: {
    titulo: "Promedio truncado a dos colas",
    descripcionTeorica:
      "E[X | x₁ ≤ X ≤ x₂] es la media condicional en el intervalo [x₁, x₂]. " +
      "Se calcula como la diferencia de expectativas parciales dividida por la probabilidad del intervalo.",
    formulaGeneral:
      "E[X \\mid x_1 \\leq X \\leq x_2] = \\frac{H_{W}(x_2) - H_{W}(x_1)}{F_{W}(x_2) - F_{W}(x_1)}",
    calcular({ params, a, b }: EntradaDosColas<ParamsWeibull>) {
      const { beta, omega } = params
      const Fa = a <= 0 ? 0 : 1 - Math.exp(-Math.pow(a / beta, omega))
      const Fb = b <= 0 ? 0 : 1 - Math.exp(-Math.pow(b / beta, omega))
      const denom = Fb - Fa
      if (denom === 0) return NaN
      return (Hw(b, params) - Hw(a, params)) / denom
    },
    formulaConValores(
      { params, a, b }: EntradaDosColas<ParamsWeibull>,
      resultado: number
    ) {
      const { beta, omega } = params
      const Ha = Hw(a, params)
      const Hb = Hw(b, params)
      const Fa = a <= 0 ? 0 : 1 - Math.exp(-Math.pow(a / beta, omega))
      const Fb = b <= 0 ? 0 : 1 - Math.exp(-Math.pow(b / beta, omega))
      return (
        `E[X \\mid ${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}] = ` +
        `\\frac{H_{W}(${numeroLatex(b)}) - H_{W}(${numeroLatex(a)})}{F_{W}(${numeroLatex(b)}) - F_{W}(${numeroLatex(a)})} = ` +
        `\\frac{${numeroLatex(Hb)} - ${numeroLatex(Ha)}}{${numeroLatex(Fb)} - ${numeroLatex(Fa)}} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── Probabilidad del intervalo ────────────────────────────

  probabilidadIntervalo: {
    titulo: "Probabilidad del intervalo \n P(x₁ ≤ X ≤ x₂)",
    descripcionTeorica:
      "La probabilidad de que X caiga en [x₁, x₂] se obtiene como " +
      "la diferencia de acumuladas: F_W(x₂) − F_W(x₁).",
    formulaGeneral: "P(x_1 \\leq X \\leq x_2) = F_{W}(x_2) - F_{W}(x_1)",
    calcular({
      params: { beta, omega },
      a,
      b,
    }: EntradaDosColas<ParamsWeibull>) {
      const Fa = a <= 0 ? 0 : 1 - Math.exp(-Math.pow(a / beta, omega))
      const Fb = b <= 0 ? 0 : 1 - Math.exp(-Math.pow(b / beta, omega))
      return Fb - Fa
    },
    formulaConValores(
      { params: { beta, omega }, a, b }: EntradaDosColas<ParamsWeibull>,
      resultado: number
    ) {
      const Fa = a <= 0 ? 0 : 1 - Math.exp(-Math.pow(a / beta, omega))
      const Fb = b <= 0 ? 0 : 1 - Math.exp(-Math.pow(b / beta, omega))
      return (
        `P(${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}) = ` +
        `F_{W}(${numeroLatex(b)}) - F_{W}(${numeroLatex(a)}) = ` +
        `${numeroLatex(Fb)} - ${numeroLatex(Fa)} = ${numeroLatex(resultado)}`
      )
    },
  },

  derivacionesDeParametros: [],
}
