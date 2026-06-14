// ============================================================
// Distribución Log-Normal  X ~ LN(m, D)
// Parámetros: m ∈ ℝ (media del log), D > 0 (desv. estándar del log)
// Soporte: x ∈ (0, +∞)
//
// Si X ~ LN(m, D), entonces ln(X) ~ N(m, D²).
// E[X] = μ_r = e^(m + D²/2)
// ============================================================

import type {
  DistribucionSpec,
  EntradaDosColas,
  EntradaP,
  EntradaX,
} from "./tipos"
import { phi, Phi, cuantilNormalEstandar } from "./matematica"
import { numeroLatex } from "./formato"

export type ParamsLogNormal = { mu: number; sigma: number }

/** z-score del log: z = (ln x − m) / D */
function zLN(x: number, mu: number, sigma: number): number {
  return (Math.log(x) - mu) / sigma
}

/** E[X] = e^(m + D²/2) */
function mediaReal(mu: number, sigma: number): number {
  return Math.exp(mu + 0.5 * sigma * sigma)
}

export const DistribucionLogNormal: DistribucionSpec<ParamsLogNormal> = {
  slug: "log-normal",
  nombre: "Log-Normal",
  descripcion:
    "La distribución log-normal modela variables cuyo logaritmo sigue una distribución normal. " +
    "Los parámetros m y D son la media y desviación estándar del logaritmo de X.",

  parametros: [
    { clave: "mu", simbolo: "m", etiqueta: "Media del log (m)" },
    {
      clave: "sigma",
      simbolo: "D",
      etiqueta: "Desv. estándar del log (D)",
      min: 0,
    },
  ],

  // ── Primitivas ────────────────────────────────────────────

  pdf(x, { mu, sigma }) {
    if (x <= 0) return 0
    return phi(zLN(x, mu, sigma)) / (x * sigma)
  },

  cdf(x, { mu, sigma }) {
    if (x <= 0) return 0
    return Phi(zLN(x, mu, sigma))
  },

  cuantil(p, { mu, sigma }) {
    return Math.exp(mu + sigma * cuantilNormalEstandar(p))
  },

  // ── Esperanza matemática ──────────────────────────────────

  esperanza: {
    titulo: "Esperanza matemática \n E(X) = μᵣ",
    descripcionTeorica:
      "La esperanza matemática E[X] de la log-normal no es el parámetro m, " +
      "sino la media real de la variable X. " +
      "Se obtiene como e^(m + D²/2), que resulta de integrar x·f(x) en (0, ∞).",
    formulaGeneral: "E(X) = \\mu_r = e^{m + D^2/2}",
    calcular({ mu, sigma }: ParamsLogNormal) {
      return mediaReal(mu, sigma)
    },
    formulaConValores({ mu, sigma }: ParamsLogNormal, resultado: number) {
      return `E(X) = e^{${numeroLatex(mu)} + ${numeroLatex(sigma)}^2/2} = ${numeroLatex(resultado)}`
    },
  },

  desvio: {
    titulo: "Desvío estándar \n σᵣ",
    descripcionTeorica:
      "El desvío estándar real σ_r de la log-normal se obtiene como la raíz cuadrada de la varianza V[X]. " +
      "La varianza es V[X] = e^(2m+D²)·(e^D²−1), lo que equivale a σ_r = μ_r·√(e^D²−1).",
    formulaGeneral:
      "\\sigma_r = \\sqrt{e^{2m+D^2} \\cdot (e^{D^2}-1)} = \\mu_r \\cdot \\sqrt{e^{D^2}-1}",
    calcular({ mu, sigma }: ParamsLogNormal) {
      return mediaReal(mu, sigma) * Math.sqrt(Math.exp(sigma * sigma) - 1)
    },
    formulaConValores({ mu, sigma }: ParamsLogNormal, resultado: number) {
      const mu_r = mediaReal(mu, sigma)
      return (
        `\\sigma_r = ${numeroLatex(mu_r)} \\cdot \\sqrt{e^{${numeroLatex(sigma)}^2}-1} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 1. Probabilidad acumulada izquierda ──────────────────

  probabilidadAcumuladaIzquierda: {
    titulo: "Probabilidad acumulada izquierda \n P(X ≤ x) o F(X)",
    descripcionTeorica:
      "La probabilidad acumulada izquierda P(X ≤ x) se obtiene aplicando " +
      "la transformación logarítmica: como ln(X) ~ N(m, D²), basta estandarizar " +
      "ln(x) y evaluar la acumulada normal estándar Φ.",
    formulaGeneral:
      "F_{LN}(x/m;D) = \\Phi\\!\\left(\\frac{\\ln x - m}{D}\\right)",
    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>) {
      if (x <= 0) return 0
      return Phi(zLN(x, mu, sigma))
    },
    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>,
      resultado: number
    ) {
      const z = zLN(x, mu, sigma)
      return (
        `F_{LN}(${numeroLatex(x)}/${numeroLatex(mu)};${numeroLatex(sigma)}) = ` +
        `\\Phi\\!\\left(\\frac{\\ln ${numeroLatex(x)} - ${numeroLatex(mu)}}{${numeroLatex(sigma)}}\\right) = ` +
        `\\Phi(${numeroLatex(z)}) = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 2. Probabilidad acumulada derecha ────────────────────

  probabilidadAcumuladaDerecha: {
    titulo: "Probabilidad acumulada derecha \n P(X > x) o G(x)",
    descripcionTeorica:
      "La probabilidad acumulada derecha P(X > x) es el complemento de la izquierda. " +
      "Equivale a Φ evaluada en el z-score negativo.",
    formulaGeneral:
      "G_{LN}(x/m;D) = 1 - \\Phi\\!\\left(\\frac{\\ln x - m}{D}\\right)",
    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>) {
      if (x <= 0) return 1
      return 1 - Phi(zLN(x, mu, sigma))
    },
    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>,
      resultado: number
    ) {
      const z = zLN(x, mu, sigma)
      return (
        `G_{LN}(${numeroLatex(x)}/${numeroLatex(mu)};${numeroLatex(sigma)}) = ` +
        `1 - \\Phi(${numeroLatex(z)}) = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 3. Valor dado probabilidad izquierda ─────────────────

  valorDadaProbabilidadIzquierda: {
    titulo: "Valor dado probabilidad izquierda",
    descripcionTeorica:
      "El fractil x_(α) es el valor tal que P(X ≤ x) = α. " +
      "Se invierte la CDF: x = e^(m + Φ⁻¹(α)·D).",
    formulaGeneral: "x_{(\\alpha)} = e^{m + Z_{(\\alpha)} \\cdot D}",
    calcular({ params: { mu, sigma }, p }: EntradaP<ParamsLogNormal>) {
      return Math.exp(mu + sigma * cuantilNormalEstandar(p))
    },
    formulaConValores(
      { params: { mu, sigma }, p }: EntradaP<ParamsLogNormal>,
      resultado: number
    ) {
      const z = cuantilNormalEstandar(p)
      return (
        `x_{(${numeroLatex(p)})} = e^{${numeroLatex(mu)} + ${numeroLatex(z)} \\cdot ${numeroLatex(sigma)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 4. Valor dado probabilidad derecha ───────────────────

  valorDadaProbabilidadDerecha: {
    titulo: "Valor dado probabilidad derecha",
    descripcionTeorica:
      "El cuantil derecho x tal que P(X > x) = α equivale a P(X ≤ x) = 1 − α. " +
      "Se aplica la fórmula del fractil con 1 − α.",
    formulaGeneral: "x = e^{m + Z_{(1-\\alpha)} \\cdot D}",
    calcular({ params: { mu, sigma }, p }: EntradaP<ParamsLogNormal>) {
      return Math.exp(mu + sigma * cuantilNormalEstandar(1 - p))
    },
    formulaConValores(
      { params: { mu, sigma }, p }: EntradaP<ParamsLogNormal>,
      resultado: number
    ) {
      const z = cuantilNormalEstandar(1 - p)
      return (
        `x = e^{${numeroLatex(mu)} + ${numeroLatex(z)} \\cdot ${numeroLatex(sigma)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 5. Expectativa parcial izquierda ─────────────────────

  expectativaParcialIzquierda: {
    titulo: "Expectativa parcial izquierda \n H(x)",
    descripcionTeorica:
      "La expectativa parcial izquierda H_LN(x/m;D) = ∫₀^x t·f(t)dt " +
      "tiene forma cerrada expresada en términos de la media real μ_r = e^(m+D²/2) " +
      "y la acumulada normal estándar Φ evaluada en z − D, donde z = (ln x − m)/D.",
    formulaGeneral:
      "H_{LN}(x/m;D) = \\mu_r \\cdot \\Phi\\!\\left(\\frac{\\ln x - m}{D} - D\\right)" +
      "\\quad\\text{donde}\\quad \\mu_r = e^{m + D^2/2}",
    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>) {
      if (x <= 0) return 0
      const z = zLN(x, mu, sigma)
      return mediaReal(mu, sigma) * Phi(z - sigma)
    },
    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>,
      resultado: number
    ) {
      const z = zLN(x, mu, sigma)
      const mu_r = mediaReal(mu, sigma)
      const arg = z - sigma
      return (
        `H_{LN}(${numeroLatex(x)}/${numeroLatex(mu)};${numeroLatex(sigma)}) = ` +
        `${numeroLatex(mu_r)} \\cdot \\Phi(${numeroLatex(z)} - ${numeroLatex(sigma)}) = ` +
        `${numeroLatex(mu_r)} \\cdot \\Phi(${numeroLatex(arg)}) = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 6. Expectativa parcial derecha ───────────────────────

  expectativaParcialDerecha: {
    titulo: "Expectativa parcial derecha \n J(x)",
    descripcionTeorica:
      "La expectativa parcial derecha J_LN(x/m;D) = ∫ₓ^∞ t·f(t)dt " +
      "se obtiene como complemento de H: J = μ_r − H_LN(x/m;D) = μ_r·(1 − Φ(z−D)). " +
      "La suma H + J = μ_r = E[X].",
    formulaGeneral:
      "J_{LN}(x/m;D) = \\mu_r \\cdot \\left[1 - \\Phi\\!\\left(\\frac{\\ln x - m}{D} - D\\right)\\right]",
    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>) {
      if (x <= 0) return mediaReal(mu, sigma)
      const z = zLN(x, mu, sigma)
      return mediaReal(mu, sigma) * (1 - Phi(z - sigma))
    },
    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>,
      resultado: number
    ) {
      const z = zLN(x, mu, sigma)
      const mu_r = mediaReal(mu, sigma)
      const arg = z - sigma
      return (
        `J_{LN}(${numeroLatex(x)}/${numeroLatex(mu)};${numeroLatex(sigma)}) = ` +
        `${numeroLatex(mu_r)} \\cdot (1 - \\Phi(${numeroLatex(arg)})) = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 7. Promedio truncado izquierdo ───────────────────────

  promedioTruncadoIzquierdo: {
    titulo: "Promedio truncado izquierdo",
    descripcionTeorica:
      "El promedio truncado izquierdo E[X | X ≤ x] es la media condicional de X " +
      "dado que X ≤ x. Se obtiene dividiendo la expectativa parcial H_LN por F_LN.",
    formulaGeneral:
      "E[X \\mid X \\leq x] = \\frac{H_{LN}(x/m;D)}{F_{LN}(x/m;D)} = " +
      "\\frac{\\mu_r \\cdot \\Phi(z - D)}{\\Phi(z)}",
    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>) {
      if (x <= 0) return -Infinity
      const z = zLN(x, mu, sigma)
      const F = Phi(z)
      if (F === 0) return -Infinity
      return (mediaReal(mu, sigma) * Phi(z - sigma)) / F
    },
    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>,
      resultado: number
    ) {
      const z = zLN(x, mu, sigma)
      const mu_r = mediaReal(mu, sigma)
      const H = mu_r * Phi(z - sigma)
      const F = Phi(z)
      return (
        `E[X \\mid X \\leq ${numeroLatex(x)}] = ` +
        `\\frac{H_{LN}}{F_{LN}} = \\frac{${numeroLatex(H)}}{${numeroLatex(F)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 8. Promedio truncado derecho ─────────────────────────

  promedioTruncadoDerecho: {
    titulo: "Promedio truncado derecho",
    descripcionTeorica:
      "El promedio truncado derecho E[X | X > x] es la media condicional de X " +
      "dado que X > x. Se obtiene dividiendo la expectativa parcial J_LN por G_LN = 1 − F_LN.",
    formulaGeneral:
      "E[X \\mid X > x] = \\frac{J_{LN}(x/m;D)}{G_{LN}(x/m;D)} = " +
      "\\frac{\\mu_r \\cdot [1 - \\Phi(z - D)]}{1 - \\Phi(z)}",
    calcular({ params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>) {
      if (x <= 0) return mediaReal(mu, sigma)
      const z = zLN(x, mu, sigma)
      const G = 1 - Phi(z)
      if (G === 0) return Infinity
      return (mediaReal(mu, sigma) * (1 - Phi(z - sigma))) / G
    },
    formulaConValores(
      { params: { mu, sigma }, x }: EntradaX<ParamsLogNormal>,
      resultado: number
    ) {
      const z = zLN(x, mu, sigma)
      const mu_r = mediaReal(mu, sigma)
      const J = mu_r * (1 - Phi(z - sigma))
      const G = 1 - Phi(z)
      return (
        `E[X \\mid X > ${numeroLatex(x)}] = ` +
        `\\frac{J_{LN}}{G_{LN}} = \\frac{${numeroLatex(J)}}{${numeroLatex(G)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 9. Promedio truncado a dos colas ─────────────────────

  promedioTruncadoDosColas: {
    titulo: "Promedio truncado a dos colas",
    descripcionTeorica:
      "El promedio truncado a dos colas E[X | a ≤ X ≤ b] es la media condicional " +
      "de X en el intervalo [a, b]. Se calcula como la diferencia de expectativas " +
      "parciales H_LN dividida por la probabilidad del intervalo F_LN(b) − F_LN(a).",
    formulaGeneral:
      "E[X \\mid a \\leq X \\leq b] = " +
      "\\frac{\\mu_r \\cdot [\\Phi(z_b - D) - \\Phi(z_a - D)]}{\\Phi(z_b) - \\Phi(z_a)}",
    calcular({
      params: { mu, sigma },
      a,
      b,
    }: EntradaDosColas<ParamsLogNormal>) {
      if (b <= 0) return NaN
      const za = a > 0 ? zLN(a, mu, sigma) : -Infinity
      const zb = zLN(Math.max(b, 1e-300), mu, sigma)
      const denom = Phi(zb) - (a > 0 ? Phi(za) : 0)
      if (denom === 0) return NaN
      const mu_r = mediaReal(mu, sigma)
      return (mu_r * (Phi(zb - sigma) - (a > 0 ? Phi(za - sigma) : 0))) / denom
    },
    formulaConValores(
      { params: { mu, sigma }, a, b }: EntradaDosColas<ParamsLogNormal>,
      resultado: number
    ) {
      const za = a > 0 ? zLN(a, mu, sigma) : -Infinity
      const zb = zLN(Math.max(b, 1e-300), mu, sigma)
      const mu_r = mediaReal(mu, sigma)
      const Ha = mu_r * (a > 0 ? Phi(za - sigma) : 0)
      const Hb = mu_r * Phi(zb - sigma)
      const Fa = a > 0 ? Phi(za) : 0
      const Fb = Phi(zb)
      return (
        `E[X \\mid ${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}] = ` +
        `\\frac{H_{LN}(${numeroLatex(b)}) - H_{LN}(${numeroLatex(a)})}{F_{LN}(${numeroLatex(b)}) - F_{LN}(${numeroLatex(a)})} = ` +
        `\\frac{${numeroLatex(Hb)} - ${numeroLatex(Ha)}}{${numeroLatex(Fb)} - ${numeroLatex(Fa)}} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 10. Probabilidad del intervalo ───────────────────────

  probabilidadIntervalo: {
    titulo: "Probabilidad del intervalo \n P(a ≤ X ≤ b)",
    descripcionTeorica:
      "La probabilidad de que X caiga en el intervalo [a, b] se obtiene " +
      "como la diferencia de acumuladas: F_LN(b) − F_LN(a).",
    formulaGeneral:
      "P(a \\leq X \\leq b) = F_{LN}(b/m;D) - F_{LN}(a/m;D) = \\Phi(z_b) - \\Phi(z_a)",
    calcular({ params: { mu, sigma }, a, b }: EntradaDosColas<ParamsLogNormal>) {
      const Fa = a > 0 ? Phi(zLN(a, mu, sigma)) : 0
      const Fb = b > 0 ? Phi(zLN(b, mu, sigma)) : 0
      return Fb - Fa
    },
    formulaConValores(
      { params: { mu, sigma }, a, b }: EntradaDosColas<ParamsLogNormal>,
      resultado: number
    ) {
      const za = a > 0 ? zLN(a, mu, sigma) : -Infinity
      const zb = b > 0 ? zLN(b, mu, sigma) : -Infinity
      const Fa = a > 0 ? Phi(za) : 0
      const Fb = b > 0 ? Phi(zb) : 0
      return (
        `P(${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}) = ` +
        `\\Phi(${numeroLatex(zb)}) - \\Phi(${numeroLatex(za)}) = ` +
        `${numeroLatex(Fb)} - ${numeroLatex(Fa)} = ${numeroLatex(resultado)}`
      )
    },
  },

  derivacionesDeParametros: [
    {
      etiquetaBoton: "Media y desvío",
      inputs: [
        { etiqueta: "Media", placeholder: "μ", min: 0 },
        { etiqueta: "Desv. estándar", placeholder: "σ", min: 0 },
      ],
      derivar([media, desvio]) {
        // E[X] = μ, V[X] = σ²  →  D² = ln(1 + (σ/μ)²), m = ln(μ) − D²/2
        const cv2 = (desvio / media) ** 2
        const sigmaSq = Math.log(1 + cv2)
        const sigmaLN = Math.sqrt(sigmaSq)
        const muLN = Math.log(media) - sigmaSq / 2
        return {
          params: { mu: muLN, sigma: sigmaLN },
          pasos: [
            {
              general:
                "D = \\sqrt{\\ln\\!\\left(1 + \\frac{\\sigma^2}{\\mu^2}\\right)}",
              conValores: `D = \\sqrt{\\ln\\!\\left(1 + \\frac{${numeroLatex(desvio)}^2}{${numeroLatex(media)}^2}\\right)} = ${numeroLatex(sigmaLN)}`,
            },
            {
              general: "m = \\ln(\\mu) - \\frac{D^2}{2}",
              conValores: `m = \\ln(${numeroLatex(media)}) - \\frac{${numeroLatex(sigmaLN)}^2}{2} = ${numeroLatex(muLN)}`,
            },
          ],
        }
      },
    },
  ],
}
