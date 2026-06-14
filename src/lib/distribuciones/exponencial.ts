// ============================================================
// Distribución Exponencial  X ~ Exp(λ)
// Parámetros: λ > 0 (tasa)
// Soporte: x ∈ [0, +∞)
// ============================================================

import type { DistribucionSpec, EntradaDosColas, EntradaP, EntradaX } from "./tipos"
import { numeroLatex } from "./formato"

export type ParamsExponencial = { lambda: number }

/** H(x) = ∫₀ˣ t·λ·e^{-λt} dt = (1 - e^{-λx})/λ - x·e^{-λx} */
function hExp(x: number, lambda: number): number {
  const elx = Math.exp(-lambda * x)
  return (1 - elx) / lambda - x * elx
}

export const DistribucionExponencial: DistribucionSpec<ParamsExponencial> = {
  slug: "exponencial",
  nombre: "Exponencial",
  descripcion:
    "La distribución exponencial modela el tiempo hasta el primer evento de un proceso de Poisson. " +
    "Su único parámetro λ es la tasa de falla (número medio de fallas por unidad de continuo). " +
    "Posee la propiedad de falta de memoria.",

  parametros: [{ clave: "lambda", simbolo: "λ", etiqueta: "Tasa (λ)", min: 0 }],

  pdf(x, { lambda }) {
    if (x < 0) return 0
    return lambda * Math.exp(-lambda * x)
  },

  cdf(x, { lambda }) {
    if (x < 0) return 0
    return 1 - Math.exp(-lambda * x)
  },

  cuantil(p, { lambda }) {
    return -Math.log(1 - p) / lambda
  },

  // ── Esperanza y desvío ─────────────────────────────────────

  esperanza: {
    titulo: "Esperanza matemática \n E(X) = 1/λ",
    descripcionTeorica:
      "La esperanza matemática E[X] de la distribución exponencial es el inverso de la tasa λ. " +
      "Representa el valor medio del tiempo hasta que ocurre el evento, conocido como MTTF (Mean Time To Failure) o MTBF.",
    formulaGeneral: "E(X) = \\mu = \\frac{1}{\\lambda}",
    calcular({ lambda }: ParamsExponencial) {
      return 1 / lambda
    },
    formulaConValores({ lambda }: ParamsExponencial, resultado: number) {
      return `E(X) = \\frac{1}{${numeroLatex(lambda)}} = ${numeroLatex(resultado)}`
    },
  },

  desvio: {
    titulo: "Desvío estándar \n σ = 1/λ",
    descripcionTeorica:
      "El desvío estándar σ de la distribución exponencial es igual a su esperanza, " +
      "lo que implica un coeficiente de variación constante del 100%.",
    formulaGeneral: "\\sigma = \\frac{1}{\\lambda}",
    calcular({ lambda }: ParamsExponencial) {
      return 1 / lambda
    },
    formulaConValores({ lambda }: ParamsExponencial, resultado: number) {
      return `\\sigma = \\frac{1}{${numeroLatex(lambda)}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 1. Probabilidad acumulada izquierda ────────────────────

  probabilidadAcumuladaIzquierda: {
    titulo: "Probabilidad acumulada izquierda \n P(X ≤ x) o F(x)",
    descripcionTeorica:
      "La probabilidad acumulada izquierda F(x) = P(X ≤ x) es la probabilidad de que la variable tome " +
      "un valor menor o igual a x. Para la distribución exponencial se obtiene integrando la PDF desde 0 hasta x, " +
      "dando una forma cerrada simple.",
    formulaGeneral: "F_{Exp}(x/\\lambda) = P(X \\leq x) = 1 - e^{-\\lambda x}",
    calcular({ params: { lambda }, x }: EntradaX<ParamsExponencial>) {
      if (x < 0) return 0
      return 1 - Math.exp(-lambda * x)
    },
    formulaConValores({ params: { lambda }, x }: EntradaX<ParamsExponencial>, resultado: number) {
      return `F_{Exp}(${numeroLatex(x)}/${numeroLatex(lambda)}) = 1 - e^{-${numeroLatex(lambda)} \\cdot ${numeroLatex(x)}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 2. Probabilidad acumulada derecha ──────────────────────

  probabilidadAcumuladaDerecha: {
    titulo: "Probabilidad acumulada derecha \n P(X ≥ x) o G(x)",
    descripcionTeorica:
      "La función de confiabilidad G(x) = P(X ≥ x) = e^{-λx} representa la probabilidad de que " +
      "la variable supere el valor x. En el contexto de fiabilidad se la conoce como función de supervivencia.",
    formulaGeneral: "G_{Exp}(x/\\lambda) = P(X \\geq x) = e^{-\\lambda x}",
    calcular({ params: { lambda }, x }: EntradaX<ParamsExponencial>) {
      if (x < 0) return 1
      return Math.exp(-lambda * x)
    },
    formulaConValores({ params: { lambda }, x }: EntradaX<ParamsExponencial>, resultado: number) {
      return `G_{Exp}(${numeroLatex(x)}/${numeroLatex(lambda)}) = e^{-${numeroLatex(lambda)} \\cdot ${numeroLatex(x)}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 3. Valor dado probabilidad izquierda ───────────────────

  valorDadaProbabilidadIzquierda: {
    titulo: "Valor dado probabilidad izquierda \n Fractil x_(α)",
    descripcionTeorica:
      "El fractil x_(α) es el valor de la variable cuya probabilidad acumulada izquierda es α. " +
      "Se obtiene invirtiendo analíticamente la CDF: x_(α) = −ln(1−α)/λ.",
    formulaGeneral: "x_{(\\alpha)} = -\\frac{\\ln(1 - \\alpha)}{\\lambda}",
    calcular({ params: { lambda }, p }: EntradaP<ParamsExponencial>) {
      return -Math.log(1 - p) / lambda
    },
    formulaConValores({ params: { lambda }, p }: EntradaP<ParamsExponencial>, resultado: number) {
      return `x_{(${numeroLatex(p)})} = -\\frac{\\ln(1 - ${numeroLatex(p)})}{${numeroLatex(lambda)}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 4. Valor dado probabilidad derecha ────────────────────

  valorDadaProbabilidadDerecha: {
    titulo: "Valor dado probabilidad derecha",
    descripcionTeorica:
      "El cuantil derecho es el valor x tal que P(X ≥ x) = p. " +
      "Se obtiene invirtiendo la función de confiabilidad G(x) = e^{-λx}.",
    formulaGeneral: "x = -\\frac{\\ln(p)}{\\lambda}",
    calcular({ params: { lambda }, p }: EntradaP<ParamsExponencial>) {
      return -Math.log(p) / lambda
    },
    formulaConValores({ params: { lambda }, p }: EntradaP<ParamsExponencial>, resultado: number) {
      return `x = -\\frac{\\ln(${numeroLatex(p)})}{${numeroLatex(lambda)}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 5. Expectativa parcial izquierda ──────────────────────

  expectativaParcialIzquierda: {
    titulo: "Expectativa parcial izquierda \n H(x)",
    descripcionTeorica:
      "La expectativa parcial izquierda H(x) = ∫₀ˣ t·f(t) dt es la porción de la esperanza " +
      "matemática correspondiente a valores menores o iguales a x. " +
      "Para la exponencial admite forma cerrada y puede expresarse mediante la CDF del modelo Gamma con α=2.",
    formulaGeneral:
      "H_{Exp}\\!\\left(\\frac{x}{\\lambda}\\right) = \\frac{1}{\\lambda}\\cdot F_{\\gamma}(x;\\,\\alpha=2,\\,\\lambda) = \\frac{1 - e^{-\\lambda x}}{\\lambda} - x\\,e^{-\\lambda x}",
    calcular({ params: { lambda }, x }: EntradaX<ParamsExponencial>) {
      if (x < 0) return 0
      return hExp(x, lambda)
    },
    formulaConValores({ params: { lambda }, x }: EntradaX<ParamsExponencial>, resultado: number) {
      return (
        `H_{Exp}\\!\\left(\\frac{${numeroLatex(x)}}{${numeroLatex(lambda)}}\\right) = ` +
        `\\frac{1 - e^{-${numeroLatex(lambda)} \\cdot ${numeroLatex(x)}}}{${numeroLatex(lambda)}} - ${numeroLatex(x)} \\cdot e^{-${numeroLatex(lambda)} \\cdot ${numeroLatex(x)}} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 6. Expectativa parcial derecha ────────────────────────

  expectativaParcialDerecha: {
    titulo: "Expectativa parcial derecha \n J(x)",
    descripcionTeorica:
      "La expectativa parcial derecha J(x) = ∫ₓ^∞ t·f(t) dt es la porción de la esperanza " +
      "correspondiente a valores mayores que x. Se obtiene por complemento: J(x) = E(X) − H(x).",
    formulaGeneral:
      "J_{Exp}\\!\\left(\\frac{x}{\\lambda}\\right) = E(X) - H_{Exp}(x/\\lambda) = \\left(\\frac{1}{\\lambda} + x\\right) e^{-\\lambda x}",
    calcular({ params: { lambda }, x }: EntradaX<ParamsExponencial>) {
      if (x < 0) return 1 / lambda
      return (1 / lambda + x) * Math.exp(-lambda * x)
    },
    formulaConValores({ params: { lambda }, x }: EntradaX<ParamsExponencial>, resultado: number) {
      return (
        `J_{Exp}\\!\\left(\\frac{${numeroLatex(x)}}{${numeroLatex(lambda)}}\\right) = ` +
        `\\left(\\frac{1}{${numeroLatex(lambda)}} + ${numeroLatex(x)}\\right) \\cdot e^{-${numeroLatex(lambda)} \\cdot ${numeroLatex(x)}} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 7. Promedio truncado izquierdo ─────────────────────────

  promedioTruncadoIzquierdo: {
    titulo: "Promedio truncado izquierdo",
    descripcionTeorica:
      "El promedio truncado izquierdo E[X | X ≤ x] es la media condicional de X dado que X no supera x. " +
      "Se calcula dividiendo la expectativa parcial izquierda H(x) por la probabilidad acumulada F(x).",
    formulaGeneral:
      "E[X \\mid X \\leq x] = \\frac{H_{Exp}(x/\\lambda)}{F_{Exp}(x/\\lambda)}",
    calcular({ params: { lambda }, x }: EntradaX<ParamsExponencial>) {
      if (x <= 0) return 0
      const F = 1 - Math.exp(-lambda * x)
      if (F === 0) return 0
      return hExp(x, lambda) / F
    },
    formulaConValores({ params: { lambda }, x }: EntradaX<ParamsExponencial>, resultado: number) {
      const H = hExp(x, lambda)
      const F = 1 - Math.exp(-lambda * x)
      return (
        `E[X \\mid X \\leq ${numeroLatex(x)}] = ` +
        `\\frac{H_{Exp}(${numeroLatex(x)}/${numeroLatex(lambda)})}{F_{Exp}(${numeroLatex(x)}/${numeroLatex(lambda)})} = ` +
        `\\frac{${numeroLatex(H)}}{${numeroLatex(F)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 8. Promedio truncado derecho ───────────────────────────

  promedioTruncadoDerecho: {
    titulo: "Promedio truncado derecho",
    descripcionTeorica:
      "El promedio truncado derecho E[X | X > x] es la media condicional de X dado que X supera x. " +
      "Gracias a la propiedad de falta de memoria de la distribución exponencial, resulta exactamente x + 1/λ: " +
      "dado que el evento no ocurrió antes de x, el tiempo de espera adicional sigue siendo Exp(λ).",
    formulaGeneral:
      "E[X \\mid X > x] = \\frac{J_{Exp}(x/\\lambda)}{G_{Exp}(x/\\lambda)} = x + \\frac{1}{\\lambda}",
    calcular({ params: { lambda }, x }: EntradaX<ParamsExponencial>) {
      return x + 1 / lambda
    },
    formulaConValores({ params: { lambda }, x }: EntradaX<ParamsExponencial>, resultado: number) {
      return (
        `E[X \\mid X > ${numeroLatex(x)}] = ${numeroLatex(x)} + \\frac{1}{${numeroLatex(lambda)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 9. Promedio truncado a dos colas ──────────────────────

  promedioTruncadoDosColas: {
    titulo: "Promedio truncado a dos colas",
    descripcionTeorica:
      "El promedio truncado a dos colas E[X | a ≤ X ≤ b] es la media condicional de X en el intervalo [a, b]. " +
      "Se calcula como la diferencia de expectativas parciales H(b) − H(a) dividida por la probabilidad del intervalo.",
    formulaGeneral:
      "E[X \\mid a \\leq X \\leq b] = \\frac{H_{Exp}(b/\\lambda) - H_{Exp}(a/\\lambda)}{F_{Exp}(b/\\lambda) - F_{Exp}(a/\\lambda)}",
    calcular({ params: { lambda }, a, b }: EntradaDosColas<ParamsExponencial>) {
      const Fa = 1 - Math.exp(-lambda * a)
      const Fb = 1 - Math.exp(-lambda * b)
      const denom = Fb - Fa
      if (denom === 0) return NaN
      return (hExp(b, lambda) - hExp(a, lambda)) / denom
    },
    formulaConValores({ params: { lambda }, a, b }: EntradaDosColas<ParamsExponencial>, resultado: number) {
      const Ha = hExp(a, lambda)
      const Hb = hExp(b, lambda)
      const Fa = 1 - Math.exp(-lambda * a)
      const Fb = 1 - Math.exp(-lambda * b)
      return (
        `E[X \\mid ${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}] = ` +
        `\\frac{H_{Exp}(${numeroLatex(b)}/${numeroLatex(lambda)}) - H_{Exp}(${numeroLatex(a)}/${numeroLatex(lambda)})}{F_{Exp}(${numeroLatex(b)}/${numeroLatex(lambda)}) - F_{Exp}(${numeroLatex(a)}/${numeroLatex(lambda)})} = ` +
        `\\frac{${numeroLatex(Hb)} - ${numeroLatex(Ha)}}{${numeroLatex(Fb)} - ${numeroLatex(Fa)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 10. Probabilidad del intervalo ────────────────────────

  probabilidadIntervalo: {
    titulo: "Probabilidad del intervalo \n P(a ≤ X ≤ b)",
    descripcionTeorica:
      "La probabilidad de que X caiga en el intervalo [a, b] se obtiene como la diferencia de " +
      "acumuladas: F(b) − F(a) = e^{-λa} − e^{-λb}.",
    formulaGeneral:
      "P(a \\leq X \\leq b) = F_{Exp}(b/\\lambda) - F_{Exp}(a/\\lambda) = e^{-\\lambda a} - e^{-\\lambda b}",
    calcular({ params: { lambda }, a, b }: EntradaDosColas<ParamsExponencial>) {
      return Math.exp(-lambda * a) - Math.exp(-lambda * b)
    },
    formulaConValores({ params: { lambda }, a, b }: EntradaDosColas<ParamsExponencial>, resultado: number) {
      return (
        `P(${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}) = ` +
        `e^{-${numeroLatex(lambda)} \\cdot ${numeroLatex(a)}} - e^{-${numeroLatex(lambda)} \\cdot ${numeroLatex(b)}} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  derivacionesDeParametros: [
    {
      etiquetaBoton: "Desde media",
      inputs: [
        { etiqueta: "Media", placeholder: "μ", min: 0 },
      ],
      derivar([media]) {
        if (media <= 0) return null
        const lambda = 1 / media
        return {
          params: { lambda },
          pasos: [
            { general: "\\mu = \\frac{1}{\\lambda}", conValores: `${numeroLatex(media)} = \\frac{1}{\\lambda}` },
            { general: "\\lambda = \\frac{1}{\\mu}", conValores: `\\lambda = \\frac{1}{${numeroLatex(media)}} = ${numeroLatex(lambda)}` },
          ],
        }
      },
    },
  ],
}
