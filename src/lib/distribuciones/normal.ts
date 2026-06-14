// ============================================================
// Distribución Normal  X ~ N(μ, σ²)
// Parámetros: μ ∈ ℝ (media), σ > 0 (desv. estándar)
// Soporte: x ∈ (−∞, +∞)
// ============================================================

import type {
  DistribucionSpec,
  EntradaDosColas,
  EntradaP,
  EntradaX,
} from "./tipos"
import { phi, Phi, cuantilNormalEstandar } from "./matematica"
import { numeroLatex } from "./formato"

export type ParamsNormal = { mu: number; sigma: number }

/** z-score estandarizado */
function zScore(x: number, mu: number, sigma: number): number {
  return (x - mu) / sigma
}

export const DistribucionNormal: DistribucionSpec<ParamsNormal> = {
  slug: "normal",
  nombre: "Normal",
  descripcion:
    "La distribución normal (o gaussiana) es la distribución continua más utilizada en estadística. " +
    "Su forma de campana simétrica está determinada por la media μ y la desviación estándar σ.",

  parametros: [
    { clave: "mu", simbolo: "μ", etiqueta: "Media (μ)" },
    {
      clave: "sigma",
      simbolo: "σ",
      etiqueta: "Desvio estándar (σ)",
      min: 0,
    },
  ],

  // ── Primitivas ─────────────────────────────────────────────

  pdf(x, { mu, sigma }) {
    return phi(zScore(x, mu, sigma)) / sigma
  },

  cdf(x, { mu, sigma }) {
    return Phi(zScore(x, mu, sigma))
  },

  cuantil(p, { mu, sigma }) {
    return mu + sigma * cuantilNormalEstandar(p)
  },

  // ── Esperanza matemática ────────────────────────────────────

  esperanza: {
    titulo: "Esperanza matemática \n E(X) = μ",
    descripcionTeorica:
      "La esperanza matemática E[X] de la distribución normal es igual a su parámetro de localización μ. " +
      "Coincide con la moda y la mediana, lo que refleja la simetría perfecta de la distribución.",
    formulaGeneral: "E(X) = \\mu",
    calcular({ mu }: ParamsNormal) {
      return mu
    },
    formulaConValores(_: ParamsNormal, resultado: number) {
      return `E(X) = \\mu = ${numeroLatex(resultado)}`
    },
  },

  desvio: {
    titulo: "Desvío estándar \n σ",
    descripcionTeorica:
      "El desvío estándar σ de la distribución normal es directamente su parámetro de escala. " +
      "Controla el ancho de la campana: a mayor σ, más dispersa es la distribución.",
    formulaGeneral: "\\sigma(X) = \\sigma",
    calcular({ sigma }: ParamsNormal) {
      return sigma
    },
    formulaConValores(_: ParamsNormal, resultado: number) {
      return `\\sigma(X) = \\sigma = ${numeroLatex(resultado)}`
    },
  },

  // ── 1. Probabilidad acumulada izquierda ────────────────────

  probabilidadAcumuladaIzquierda: {
    titulo: "Probabilidad acumulada izquierda \n P(X ≤ x) o F(X)",
    descripcionTeorica:
      "La probabilidad acumulada izquierda P(X ≤ x) es el área bajo la curva de densidad " +
      "desde −∞ hasta x. Para la distribución normal se expresa mediante la función de " +
      "distribución acumulada estándar Φ, evaluada en el z-score del valor.",

    formulaGeneral:
      "P(X \\leq x) = \\Phi\\!\\left(\\frac{x - \\mu}{\\sigma}\\right)",

    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsNormal>) {
      return Phi(zScore(x, mu, sigma))
    },

    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsNormal>,
      resultado: number
    ) {
      const z = zScore(x, mu, sigma)
      return (
        `P(X \\leq ${numeroLatex(x)}) = ` +
        `\\Phi\\!\\left(\\frac{${numeroLatex(x)} - ${numeroLatex(mu)}}{${numeroLatex(sigma)}}\\right) = ` +
        `\\Phi(${numeroLatex(z)}) = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 2. Probabilidad acumulada derecha ──────────────────────

  probabilidadAcumuladaDerecha: {
    titulo: "Probabilidad acumulada derecha \n P(X > x) o G(x)",
    descripcionTeorica:
      "La probabilidad acumulada derecha P(X > x) es el complemento de la acumulada izquierda, " +
      "y representa el área desde x hasta +∞. Dada la continuidad, P(X > x) = 1 − P(X ≤ x).",

    formulaGeneral:
      "P(X > x) = 1 - \\Phi\\!\\left(\\frac{x - \\mu}{\\sigma}\\right)",

    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsNormal>) {
      return 1 - Phi(zScore(x, mu, sigma))
    },

    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsNormal>,
      resultado: number
    ) {
      const z = zScore(x, mu, sigma)
      return `P(X > ${numeroLatex(x)}) = 1 - \\Phi(${numeroLatex(z)}) = ${numeroLatex(resultado)}`
    },
  },

  // ── 3. Valor dado probabilidad izquierda ───────────────────

  valorDadaProbabilidadIzquierda: {
    titulo: "Valor dado probabilidad izquierda",
    descripcionTeorica:
      "El cuantil izquierdo es el valor x tal que P(X ≤ x) = p. " +
      "Se obtiene invirtiendo la CDF: x = μ + σ · Φ⁻¹(p), " +
      "donde Φ⁻¹ es la función cuantil de la normal estándar.",

    formulaGeneral: "x = \\mu + \\sigma \\cdot \\Phi^{-1}(p)",

    calcular({ params: { mu, sigma }, p }: EntradaP<ParamsNormal>) {
      return mu + sigma * cuantilNormalEstandar(p)
    },

    formulaConValores(
      { params: { mu, sigma }, p }: EntradaP<ParamsNormal>,
      resultado: number
    ) {
      return `x = ${numeroLatex(mu)} + ${numeroLatex(sigma)} \\cdot \\Phi^{-1}(${numeroLatex(p)}) = ${numeroLatex(resultado)}`
    },
  },

  // ── 4. Valor dado probabilidad derecha ────────────────────

  valorDadaProbabilidadDerecha: {
    titulo: "Valor dado probabilidad derecha",
    descripcionTeorica:
      "El cuantil derecho es el valor x tal que P(X > x) = p, " +
      "equivalente a P(X ≤ x) = 1 − p. Se invierte la CDF con la probabilidad complementaria.",

    formulaGeneral: "x = \\mu + \\sigma \\cdot \\Phi^{-1}(1 - p)",

    calcular({ params: { mu, sigma }, p }: EntradaP<ParamsNormal>) {
      return mu + sigma * cuantilNormalEstandar(1 - p)
    },

    formulaConValores(
      { params: { mu, sigma }, p }: EntradaP<ParamsNormal>,
      resultado: number
    ) {
      return `x = ${numeroLatex(mu)} + ${numeroLatex(sigma)} \\cdot \\Phi^{-1}(1 - ${numeroLatex(p)}) = ${numeroLatex(resultado)}`
    },
  },

  // ── 5. Expectativa parcial izquierda ──────────────────────

  expectativaParcialIzquierda: {
    titulo: "Expectativa parcial izquierda \n H(x)",
    descripcionTeorica:
      "La expectativa parcial izquierda H_N(x/μ;σ) = ∫₋∞ˣ t · f(t) dt " +
      "es el valor esperado de X ponderado por la región izquierda, sin dividir por su probabilidad. " +
      "Para la normal tiene forma cerrada usando la función de distribución acumulada F_N y la densidad normal.",

    formulaGeneral:
      "H_{N}(x/\\mu;\\sigma) = \\mu \\cdot F_{N}(x/\\mu;\\sigma) - \\frac{\\sigma}{\\sqrt{2\\pi}} \\cdot e^{-\\frac{1}{2}\\left(\\frac{x - \\mu}{\\sigma}\\right)^2}",

    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsNormal>) {
      const z = zScore(x, mu, sigma)
      return mu * Phi(z) - sigma * phi(z)
    },

    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsNormal>,
      resultado: number
    ) {
      const z = zScore(x, mu, sigma)
      return (
        `H_{N}(${numeroLatex(x)}/${numeroLatex(mu)};${numeroLatex(sigma)}) = ` +
        `${numeroLatex(mu)} \\cdot \\Phi(${numeroLatex(z)}) - \\frac{${numeroLatex(sigma)}}{\\sqrt{2\\pi}} \\cdot e^{-\\frac{1}{2}(${numeroLatex(z)})^2} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 6. Expectativa parcial derecha ────────────────────────

  expectativaParcialDerecha: {
    titulo: "Expectativa parcial derecha \n J(X)",
    descripcionTeorica:
      "La expectativa parcial derecha E[X; X > x] = ∫ₓ^∞ t · f(t) dt " +
      "es el valor esperado de X ponderado por la región derecha. " +
      "La suma de ambas expectativas parciales es igual a la media: E[X; X ≤ x] + E[X; X > x] = μ.",

    formulaGeneral:
      "E[X;\\, X > x] = \\mu\\,(1 - \\Phi(z)) + \\sigma\\,\\phi(z)" +
      "\\quad\\text{donde}\\quad z = \\frac{x - \\mu}{\\sigma}",

    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsNormal>) {
      const z = zScore(x, mu, sigma)
      return mu * (1 - Phi(z)) + sigma * phi(z)
    },

    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsNormal>,
      resultado: number
    ) {
      const z = zScore(x, mu, sigma)
      return (
        `E[X;\\, X > ${numeroLatex(x)}] = ` +
        `${numeroLatex(mu)} \\cdot (1 - \\Phi(${numeroLatex(z)})) + ${numeroLatex(sigma)} \\cdot \\phi(${numeroLatex(z)}) = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 7. Promedio truncado izquierdo ─────────────────────────

  promedioTruncadoIzquierdo: {
    titulo: "Promedio truncado izquierdo",
    descripcionTeorica:
      "El promedio truncado izquierdo E[X | X ≤ x] es la media condicional de X " +
      "dado que X ≤ x. Se obtiene dividiendo la expectativa parcial izquierda H_N " +
      "por la probabilidad acumulada F_N.",

    formulaGeneral:
      "E[X \\mid X \\leq x] = \\frac{H_N(x/\\mu;\\sigma)}{F_N(x/\\mu;\\sigma)}",

    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsNormal>) {
      const z = zScore(x, mu, sigma)
      const PhiZ = Phi(z)
      if (PhiZ === 0) return -Infinity
      return mu - sigma * (phi(z) / PhiZ)
    },

    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsNormal>,
      resultado: number
    ) {
      const z = zScore(x, mu, sigma)
      const H = mu * Phi(z) - sigma * phi(z)
      const F = Phi(z)
      return (
        `E[X \\mid X \\leq ${numeroLatex(x)}] = ` +
        `\\frac{H_N(${numeroLatex(x)}/${numeroLatex(mu)};${numeroLatex(sigma)})}{F_N(${numeroLatex(x)}/${numeroLatex(mu)};${numeroLatex(sigma)})} = ` +
        `\\frac{${numeroLatex(H)}}{${numeroLatex(F)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 8. Promedio truncado derecho ───────────────────────────

  promedioTruncadoDerecho: {
    titulo: "Promedio truncado derecho",
    descripcionTeorica:
      "El promedio truncado derecho E[X | X > x] es la media condicional de X " +
      "dado que X > x. Se obtiene dividiendo la expectativa parcial derecha J_N " +
      "por la probabilidad de la cola derecha G_N = 1 − F_N.",

    formulaGeneral:
      "E[X \\mid X > x] = \\frac{J_N(x/\\mu;\\sigma)}{G_N(x/\\mu;\\sigma)}",

    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsNormal>) {
      const z = zScore(x, mu, sigma)
      const survZ = 1 - Phi(z)
      if (survZ === 0) return Infinity
      return mu + sigma * (phi(z) / survZ)
    },

    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsNormal>,
      resultado: number
    ) {
      const z = zScore(x, mu, sigma)
      const J = mu * (1 - Phi(z)) + sigma * phi(z)
      const G = 1 - Phi(z)
      return (
        `E[X \\mid X > ${numeroLatex(x)}] = ` +
        `\\frac{J_N(${numeroLatex(x)}/${numeroLatex(mu)};${numeroLatex(sigma)})}{G_N(${numeroLatex(x)}/${numeroLatex(mu)};${numeroLatex(sigma)})} = ` +
        `\\frac{${numeroLatex(J)}}{${numeroLatex(G)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 9. Promedio truncado a dos colas ──────────────────────

  promedioTruncadoDosColas: {
    titulo: "Promedio truncado a dos colas",
    descripcionTeorica:
      "El promedio truncado a dos colas E[X | a ≤ X ≤ b] es la media condicional " +
      "de X en el intervalo [a, b]. Se calcula como la diferencia de expectativas " +
      "parciales H_N dividida por la probabilidad del intervalo F_N(b) − F_N(a).",

    formulaGeneral:
      "E[X \\mid a \\leq X \\leq b] = \\frac{H_N(b/\\mu;\\sigma) - H_N(a/\\mu;\\sigma)}{F_N(b/\\mu;\\sigma) - F_N(a/\\mu;\\sigma)}",

    calcular({ params: { mu, sigma }, a, b }: EntradaDosColas<ParamsNormal>) {
      const za = zScore(a, mu, sigma)
      const zb = zScore(b, mu, sigma)
      const denom = Phi(zb) - Phi(za)
      if (denom === 0) return NaN
      return mu - sigma * ((phi(zb) - phi(za)) / denom)
    },

    formulaConValores(
      { params: { mu, sigma }, a, b }: EntradaDosColas<ParamsNormal>,
      resultado: number
    ) {
      const za = zScore(a, mu, sigma)
      const zb = zScore(b, mu, sigma)
      const Ha = mu * Phi(za) - sigma * phi(za)
      const Hb = mu * Phi(zb) - sigma * phi(zb)
      const Fa = Phi(za)
      const Fb = Phi(zb)
      return (
        `E[X \\mid ${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}] = ` +
        `\\frac{H_N(${numeroLatex(b)}/${numeroLatex(mu)};${numeroLatex(sigma)}) - H_N(${numeroLatex(a)}/${numeroLatex(mu)};${numeroLatex(sigma)})}{F_N(${numeroLatex(b)}/${numeroLatex(mu)};${numeroLatex(sigma)}) - F_N(${numeroLatex(a)}/${numeroLatex(mu)};${numeroLatex(sigma)})} = ` +
        `\\frac{${numeroLatex(Hb)} - ${numeroLatex(Ha)}}{${numeroLatex(Fb)} - ${numeroLatex(Fa)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 10. Probabilidad del intervalo ────────────────────────

  probabilidadIntervalo: {
    titulo: "Probabilidad del intervalo \n P(a ≤ X ≤ b)",
    descripcionTeorica:
      "La probabilidad de que X caiga en el intervalo [a, b] se obtiene " +
      "como la diferencia de acumuladas: F_N(b) − F_N(a).",
    formulaGeneral:
      "P(a \\leq X \\leq b) = F_N(b/\\mu;\\sigma) - F_N(a/\\mu;\\sigma) = \\Phi(z_b) - \\Phi(z_a)",
    calcular({ params: { mu, sigma }, a, b }: EntradaDosColas<ParamsNormal>) {
      return Phi(zScore(b, mu, sigma)) - Phi(zScore(a, mu, sigma))
    },
    formulaConValores(
      { params: { mu, sigma }, a, b }: EntradaDosColas<ParamsNormal>,
      resultado: number
    ) {
      const za = zScore(a, mu, sigma)
      const zb = zScore(b, mu, sigma)
      return (
        `P(${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}) = ` +
        `\\Phi(${numeroLatex(zb)}) - \\Phi(${numeroLatex(za)}) = ${numeroLatex(resultado)}`
      )
    },
  },
}
