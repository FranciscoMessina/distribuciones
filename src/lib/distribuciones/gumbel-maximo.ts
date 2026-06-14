// ============================================================
// Distribución Gumbel máximo  X ~ Gumbel(μ, β)
// Parámetros: μ ∈ ℝ (ubicación/moda), β > 0 (escala)
// Soporte: x ∈ (−∞, +∞)
// Usada para modelar máximos de muestras grandes.
// ============================================================

import type { DistribucionSpec, EntradaDosColas, EntradaP, EntradaX } from "./tipos"
import { EULER_MASCHERONI, SQRT_2PI } from "./matematica"
import { numeroLatex } from "./formato"

export type ParamsGumbelMaximo = { mu: number; beta: number }

function zG(x: number, mu: number, beta: number) {
  return (x - mu) / beta
}

// Expectativa parcial izquierda — aproximación analítica del libro
function hGM(x: number, mu: number, beta: number): number {
  const t = Math.exp(-zG(x, mu, beta)) // t = e^{-(x-μ)/β}
  const F = Math.exp(-t) // F(x) = e^{-t}
  const E = mu + beta * EULER_MASCHERONI
  const cbrtT = Math.cbrt(t)
  const correction =
    (beta / SQRT_2PI) *
    (cbrtT / 2 - 5 / 3) *
    Math.exp(-0.5 * (3 * cbrtT - 8 / 3) ** 2)
  return E * F + correction
}

export const DistribucionGumbelMaximo: DistribucionSpec<ParamsGumbelMaximo> = {
  slug: "gumbel-maximo",
  nombre: "Gumbel máximo",
  descripcion:
    "La distribución de Gumbel para máximos modela el valor extremo máximo de una muestra grande. " +
    "Es parte de la familia de distribuciones de valores extremos.",

  parametros: [
    { clave: "mu", simbolo: "θ", etiqueta: "Ubicación (θ)" },
    { clave: "beta", simbolo: "β", etiqueta: "Escala (β)", min: 0 },
  ],

  pdf(x, { mu, beta }) {
    const z = zG(x, mu, beta)
    return (1 / beta) * Math.exp(-(z + Math.exp(-z)))
  },

  cdf(x, { mu, beta }) {
    return Math.exp(-Math.exp(-zG(x, mu, beta)))
  },

  cuantil(p, { mu, beta }) {
    return mu - beta * Math.log(-Math.log(p))
  },

  // ── 1. Probabilidad acumulada izquierda ──────────────────

  probabilidadAcumuladaIzquierda: {
    titulo: "Probabilidad acumulada izquierda",
    descripcionTeorica:
      "F_{GM}(x) = P(X ≤ x). Para la Gumbel máximo tiene forma cerrada mediante doble exponencial.",
    formulaGeneral: "F_{GM}(x) = e^{-e^{-(x-\\theta)/\\beta}}",
    calcular({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>) {
      return Math.exp(-Math.exp(-zG(x, mu, beta)))
    },
    formulaConValores({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>, resultado: number) {
      const z = zG(x, mu, beta)
      return `F_{GM}(${numeroLatex(x)}) = e^{-e^{-${numeroLatex(z)}}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 2. Probabilidad acumulada derecha ────────────────────

  probabilidadAcumuladaDerecha: {
    titulo: "Probabilidad acumulada derecha",
    descripcionTeorica: "P(X > x) = 1 − F_{GM}(x).",
    formulaGeneral: "P(X > x) = 1 - e^{-e^{-(x-\\theta)/\\beta}}",
    calcular({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>) {
      return 1 - Math.exp(-Math.exp(-zG(x, mu, beta)))
    },
    formulaConValores({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>, resultado: number) {
      const z = zG(x, mu, beta)
      return `P(X > ${numeroLatex(x)}) = 1 - e^{-e^{-${numeroLatex(z)}}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 3. Valor dado probabilidad izquierda ─────────────────

  valorDadaProbabilidadIzquierda: {
    titulo: "Valor dado probabilidad izquierda",
    descripcionTeorica: "Cuantil (fractil) x tal que P(X ≤ x) = α. Forma cerrada para la Gumbel máximo.",
    formulaGeneral: "x_{(\\alpha)} = \\theta - \\beta \\ln(-\\ln \\alpha)",
    calcular({ params: { mu, beta }, p }: EntradaP<ParamsGumbelMaximo>) {
      return mu - beta * Math.log(-Math.log(p))
    },
    formulaConValores({ params: { mu, beta }, p }: EntradaP<ParamsGumbelMaximo>, resultado: number) {
      return `x = ${numeroLatex(mu)} - ${numeroLatex(beta)} \\ln(-\\ln ${numeroLatex(p)}) = ${numeroLatex(resultado)}`
    },
  },

  // ── 4. Valor dado probabilidad derecha ───────────────────

  valorDadaProbabilidadDerecha: {
    titulo: "Valor dado probabilidad derecha",
    descripcionTeorica: "Cuantil x tal que P(X > x) = α, equivalente a P(X ≤ x) = 1 − α.",
    formulaGeneral: "x = \\theta - \\beta \\ln(-\\ln(1-\\alpha))",
    calcular({ params: { mu, beta }, p }: EntradaP<ParamsGumbelMaximo>) {
      return mu - beta * Math.log(-Math.log(1 - p))
    },
    formulaConValores({ params: { mu, beta }, p }: EntradaP<ParamsGumbelMaximo>, resultado: number) {
      return `x = ${numeroLatex(mu)} - ${numeroLatex(beta)} \\ln(-\\ln(1 - ${numeroLatex(p)})) = ${numeroLatex(resultado)}`
    },
  },

  // ── 5. Expectativa parcial izquierda ─────────────────────

  expectativaParcialIzquierda: {
    titulo: "Expectativa parcial izquierda \n H(x)",
    descripcionTeorica:
      "H_{GM}(x) = ∫₋∞ˣ t·f(t) dt. Se calcula mediante la aproximación analítica del libro, " +
      "con t = e^{−(x−θ)/β}.",
    formulaGeneral:
      "H_{GM}(x) \\approx (\\theta + \\beta \\cdot \\gamma) \\cdot e^{-t} + " +
      "\\frac{\\beta}{\\sqrt{2\\pi}} \\cdot \\left(\\frac{t^{1/3}}{2} - \\frac{5}{3}\\right) \\cdot " +
      "e^{-\\frac{1}{2}\\left(3t^{1/3} - \\frac{8}{3}\\right)^2}",
    calcular({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>) {
      return hGM(x, mu, beta)
    },
    formulaConValores({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>, resultado: number) {
      const t = Math.exp(-zG(x, mu, beta))
      return (
        `t = e^{-(${numeroLatex(x)} - ${numeroLatex(mu)})/${numeroLatex(beta)}} = ${numeroLatex(t)} \\quad` +
        `H_{GM}(${numeroLatex(x)}) \\approx ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 6. Expectativa parcial derecha ───────────────────────

  expectativaParcialDerecha: {
    titulo: "Expectativa parcial derecha \n J(x)",
    descripcionTeorica:
      "J_{GM}(x) = E[X] − H_{GM}(x). La suma de ambas expectativas parciales es igual a la esperanza.",
    formulaGeneral:
      "J_{GM}(x) = (\\theta + \\beta \\cdot \\gamma) - H_{GM}(x)",
    calcular({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>) {
      const E = mu + beta * EULER_MASCHERONI
      return E - hGM(x, mu, beta)
    },
    formulaConValores({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>, resultado: number) {
      const E = mu + beta * EULER_MASCHERONI
      const H = hGM(x, mu, beta)
      return `J_{GM}(${numeroLatex(x)}) = ${numeroLatex(E)} - ${numeroLatex(H)} = ${numeroLatex(resultado)}`
    },
  },

  // ── 7. Promedio truncado izquierdo ────────────────────────

  promedioTruncadoIzquierdo: {
    titulo: "Promedio truncado izquierdo",
    descripcionTeorica: "Media condicional E[X | X ≤ x] = H(x) / F(x).",
    formulaGeneral: "E[X \\mid X \\leq x] = \\frac{H_{GM}(x)}{F_{GM}(x)}",
    calcular({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>) {
      const F = Math.exp(-Math.exp(-zG(x, mu, beta)))
      if (F === 0) return -Infinity
      return hGM(x, mu, beta) / F
    },
    formulaConValores({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>, resultado: number) {
      const F = Math.exp(-Math.exp(-zG(x, mu, beta)))
      const H = hGM(x, mu, beta)
      return `E[X \\mid X \\leq ${numeroLatex(x)}] = \\frac{${numeroLatex(H)}}{${numeroLatex(F)}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 8. Promedio truncado derecho ──────────────────────────

  promedioTruncadoDerecho: {
    titulo: "Promedio truncado derecho",
    descripcionTeorica: "Media condicional E[X | X > x] = (E[X] − H(x)) / (1 − F(x)).",
    formulaGeneral:
      "E[X \\mid X > x] = \\frac{(\\theta + \\beta \\cdot \\gamma) - H_{GM}(x)}{1 - F_{GM}(x)}",
    calcular({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>) {
      const F = Math.exp(-Math.exp(-zG(x, mu, beta)))
      const complement = 1 - F
      if (complement === 0) return Infinity
      const E = mu + beta * EULER_MASCHERONI
      return (E - hGM(x, mu, beta)) / complement
    },
    formulaConValores({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMaximo>, resultado: number) {
      const F = Math.exp(-Math.exp(-zG(x, mu, beta)))
      const E = mu + beta * EULER_MASCHERONI
      const H = hGM(x, mu, beta)
      return (
        `E[X \\mid X > ${numeroLatex(x)}] = ` +
        `\\frac{${numeroLatex(E)} - ${numeroLatex(H)}}{1 - ${numeroLatex(F)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 9. Promedio truncado dos colas ────────────────────────

  promedioTruncadoDosColas: {
    titulo: "Promedio truncado a dos colas",
    descripcionTeorica: "Media condicional E[X | a ≤ X ≤ b] = (H(b) − H(a)) / (F(b) − F(a)).",
    formulaGeneral:
      "E[X \\mid a \\leq X \\leq b] = \\frac{H_{GM}(b) - H_{GM}(a)}{F_{GM}(b) - F_{GM}(a)}",
    calcular({ params: { mu, beta }, a, b }: EntradaDosColas<ParamsGumbelMaximo>) {
      const Fb = Math.exp(-Math.exp(-zG(b, mu, beta)))
      const Fa = Math.exp(-Math.exp(-zG(a, mu, beta)))
      const dF = Fb - Fa
      if (dF === 0) return NaN
      return (hGM(b, mu, beta) - hGM(a, mu, beta)) / dF
    },
    formulaConValores({ params: { mu, beta }, a, b }: EntradaDosColas<ParamsGumbelMaximo>, resultado: number) {
      const Hb = hGM(b, mu, beta)
      const Ha = hGM(a, mu, beta)
      const Fb = Math.exp(-Math.exp(-zG(b, mu, beta)))
      const Fa = Math.exp(-Math.exp(-zG(a, mu, beta)))
      return (
        `E[X \\mid ${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}] = ` +
        `\\frac{${numeroLatex(Hb)} - ${numeroLatex(Ha)}}{${numeroLatex(Fb)} - ${numeroLatex(Fa)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── Esperanza y desvío ────────────────────────────────────

  esperanza: {
    titulo: "Esperanza E[X]",
    descripcionTeorica:
      "La esperanza es θ + β·γ, donde γ ≈ 0.5772 es la constante de Euler-Mascheroni.",
    formulaGeneral: "E[X] = \\theta + \\beta \\cdot \\gamma",
    calcular({ mu, beta }: ParamsGumbelMaximo) {
      return mu + beta * EULER_MASCHERONI
    },
    formulaConValores({ mu, beta }: ParamsGumbelMaximo, resultado: number) {
      return `E[X] = ${numeroLatex(mu)} + ${numeroLatex(beta)} \\cdot ${numeroLatex(EULER_MASCHERONI)} = ${numeroLatex(resultado)}`
    },
  },

  desvio: {
    titulo: "Desvío estándar σ",
    descripcionTeorica: "El desvío estándar de la distribución Gumbel máximo es π·β/√6.",
    formulaGeneral: "\\sigma = \\frac{\\pi \\cdot \\beta}{\\sqrt{6}}",
    calcular({ beta }: ParamsGumbelMaximo) {
      return (Math.PI * beta) / Math.sqrt(6)
    },
    formulaConValores({ beta }: ParamsGumbelMaximo, resultado: number) {
      return `\\sigma = \\frac{\\pi \\cdot ${numeroLatex(beta)}}{\\sqrt{6}} = ${numeroLatex(resultado)}`
    },
  },

  // ── Probabilidad en intervalo ─────────────────────────────

  probabilidadIntervalo: {
    titulo: "Probabilidad en intervalo",
    descripcionTeorica: "P(a ≤ X ≤ b) = F(b) − F(a).",
    formulaGeneral:
      "P(a \\leq X \\leq b) = e^{-e^{-(b-\\theta)/\\beta}} - e^{-e^{-(a-\\theta)/\\beta}}",
    calcular({ params: { mu, beta }, a, b }: EntradaDosColas<ParamsGumbelMaximo>) {
      return (
        Math.exp(-Math.exp(-zG(b, mu, beta))) -
        Math.exp(-Math.exp(-zG(a, mu, beta)))
      )
    },
    formulaConValores({ params: { mu, beta }, a, b }: EntradaDosColas<ParamsGumbelMaximo>, resultado: number) {
      const Fb = Math.exp(-Math.exp(-zG(b, mu, beta)))
      const Fa = Math.exp(-Math.exp(-zG(a, mu, beta)))
      return `P(${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}) = ${numeroLatex(Fb)} - ${numeroLatex(Fa)} = ${numeroLatex(resultado)}`
    },
  },

  // ── Derivación de parámetros ──────────────────────────────

  derivacionesDeParametros: [
    {
      etiquetaBoton: "Media y desvío",
      inputs: [
        { etiqueta: "Media", placeholder: "μ" },
        { etiqueta: "Desv. estándar", placeholder: "σ", min: 0 },
      ],
      derivar([media, desvio]) {
        // Para Gumbel máximo: media = μ + β·γ, desv = π·β/√6
        const beta = (desvio * Math.sqrt(6)) / Math.PI
        const mu = media - beta * EULER_MASCHERONI
        return {
          params: { mu, beta },
          pasos: [
            {
              general: "\\beta = \\frac{\\sigma \\sqrt{6}}{\\pi}",
              conValores: `\\beta = \\frac{${numeroLatex(desvio)} \\cdot \\sqrt{6}}{\\pi} = ${numeroLatex(beta)}`,
            },
            {
              general: "\\theta = \\bar{x} - \\beta \\cdot \\gamma",
              conValores: `\\theta = ${numeroLatex(media)} - ${numeroLatex(beta)} \\cdot ${numeroLatex(EULER_MASCHERONI)} = ${numeroLatex(mu)}`,
            },
          ],
        }
      },
    },
  ],
}
