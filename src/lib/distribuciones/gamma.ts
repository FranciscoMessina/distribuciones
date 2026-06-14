// ============================================================
// Distribución Gamma  X ~ Gamma(r, λ)
// Parámetros: r > 0 (forma), λ > 0 (tasa)
// Soporte: x ∈ [0, +∞)
// ============================================================

import type { DistribucionSpec, EntradaDosColas, EntradaP, EntradaX } from "./tipos"
import { gammainc, gammaln, cuantilNormalEstandar } from "./matematica"
import { numeroLatex } from "./formato"

export type ParamsGamma = { r: number; lambda: number }

export function modaGamma({ r, lambda }: ParamsGamma): number {
  return r >= 1 ? (r - 1) / lambda : 0
}

/** H_γ(x|r;λ) = (r/λ) · F_γ(x|r+1;λ) */
function hGamma(x: number, { r, lambda }: ParamsGamma): number {
  if (x <= 0) return 0
  return (r / lambda) * gammainc(r + 1, lambda * x)
}

/** Wilson-Hilferty: cuantil aproximado de Gamma(r, λ) */
function cuantilWH(p: number, r: number, lambda: number): number {
  const Z = cuantilNormalEstandar(p)
  const t = Z / (3 * Math.sqrt(r)) - 1 / (9 * r) + 1
  if (t <= 0) return 0
  return (r / lambda) * Math.pow(t, 3)
}

export const DistribucionGamma: DistribucionSpec<ParamsGamma> = {
  slug: "gamma",
  nombre: "Gamma",
  descripcion:
    "La distribución Gamma modela el tiempo hasta que ocurren r eventos en un proceso de Poisson con tasa λ. " +
    "Generaliza la exponencial (r=1) y con r entero se conoce como distribución de Erlang. " +
    "Rige variables positivas asimétricas con forma flexible.",

  parametros: [
    { clave: "r", simbolo: "r", etiqueta: "Forma (r)", min: 0 },
    { clave: "lambda", simbolo: "λ", etiqueta: "Tasa (λ)", min: 0 },
  ],

  pdf(x, { r, lambda }) {
    if (x <= 0) return 0
    return Math.exp(r * Math.log(lambda) + (r - 1) * Math.log(x) - lambda * x - gammaln(r))
  },

  cdf(x, { r, lambda }) {
    if (x <= 0) return 0
    return gammainc(r, lambda * x)
  },

  cuantil(p, { r, lambda }) {
    return cuantilWH(p, r, lambda)
  },

  // ── Esperanza y desvío ─────────────────────────────────────

  esperanza: {
    titulo: "Esperanza matemática \n E(X) = r/λ",
    descripcionTeorica:
      "La esperanza matemática E[X] de la distribución Gamma es el cociente entre el parámetro de forma r " +
      "y la tasa λ. Representa el valor medio del continuo observado.",
    formulaGeneral: "E(X) = \\mu = \\frac{r}{\\lambda}",
    calcular({ r, lambda }: ParamsGamma) {
      return r / lambda
    },
    formulaConValores({ r, lambda }: ParamsGamma, resultado: number) {
      return `E(X) = \\frac{${numeroLatex(r)}}{${numeroLatex(lambda)}} = ${numeroLatex(resultado)}`
    },
  },

  desvio: {
    titulo: "Desvío estándar \n σ = √r/λ",
    descripcionTeorica:
      "El desvío estándar σ de la distribución Gamma es la raíz cuadrada de la varianza r/λ². " +
      "A mayor r con λ fijo, la distribución se vuelve más simétrica y menos dispersa relativamente.",
    formulaGeneral: "\\sigma = \\sqrt{\\frac{r}{\\lambda^2}} = \\frac{\\sqrt{r}}{\\lambda}",
    calcular({ r, lambda }: ParamsGamma) {
      return Math.sqrt(r) / lambda
    },
    formulaConValores({ r, lambda }: ParamsGamma, resultado: number) {
      return `\\sigma = \\frac{\\sqrt{${numeroLatex(r)}}}{${numeroLatex(lambda)}} = ${numeroLatex(resultado)}`
    },
  },

  // ── 1. Probabilidad acumulada izquierda ────────────────────

  probabilidadAcumuladaIzquierda: {
    titulo: "Probabilidad acumulada izquierda \n P(X ≤ x) o F(x)",
    descripcionTeorica:
      "La probabilidad acumulada izquierda F_γ(x|r;λ) = P(X ≤ x) se calcula mediante la función " +
      "gamma incompleta regularizada inferior γ(r, λx)/Γ(r). " +
      "Para r entero puede obtenerse con la relación de Molina usando la acumulada derecha de Poisson.",
    formulaGeneral:
      "F_{\\gamma}(x|r;\\lambda) = \\frac{\\gamma(r,\\, \\lambda x)}{\\Gamma(r)}",
    calcular({ params: { r, lambda }, x }: EntradaX<ParamsGamma>) {
      if (x <= 0) return 0
      return gammainc(r, lambda * x)
    },
    formulaConValores({ params: { r, lambda }, x }: EntradaX<ParamsGamma>, resultado: number) {
      return (
        `F_{\\gamma}(${numeroLatex(x)}|${numeroLatex(r)};${numeroLatex(lambda)}) = ` +
        `\\frac{\\gamma(${numeroLatex(r)},\\, ${numeroLatex(lambda * x)})}{\\Gamma(${numeroLatex(r)})} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 2. Probabilidad acumulada derecha ──────────────────────

  probabilidadAcumuladaDerecha: {
    titulo: "Probabilidad acumulada derecha \n P(X ≥ x) o G(x)",
    descripcionTeorica:
      "La probabilidad acumulada derecha G_γ(x|r;λ) = P(X ≥ x) es el complemento de la CDF. " +
      "Para r entero puede calcularse con la relación de Molina: G_γ(x|r;λ) = F_po(r−1|m=λx), " +
      "donde F_po es la acumulada izquierda de Poisson.",
    formulaGeneral:
      "G_{\\gamma}(x|r;\\lambda) = 1 - F_{\\gamma}(x|r;\\lambda) = \\frac{\\Gamma(r,\\, \\lambda x)}{\\Gamma(r)}",
    calcular({ params: { r, lambda }, x }: EntradaX<ParamsGamma>) {
      if (x <= 0) return 1
      return 1 - gammainc(r, lambda * x)
    },
    formulaConValores({ params: { r, lambda }, x }: EntradaX<ParamsGamma>, resultado: number) {
      return (
        `G_{\\gamma}(${numeroLatex(x)}|${numeroLatex(r)};${numeroLatex(lambda)}) = ` +
        `1 - F_{\\gamma}(${numeroLatex(x)}|${numeroLatex(r)};${numeroLatex(lambda)}) = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 3. Valor dado probabilidad izquierda ───────────────────

  valorDadaProbabilidadIzquierda: {
    titulo: "Valor dado probabilidad izquierda \n Fractil x_(α)",
    descripcionTeorica:
      "El fractil x_(α) se calcula mediante la aproximación de Wilson-Hilferty, que transforma " +
      "la distribución Gamma a una normal estándar. Es exacto con la tabla de χ² mediante " +
      "x_(α) = χ²_(α; ν=2r) / (2λ).",
    formulaGeneral:
      "x_{(\\alpha)} \\approx \\frac{r}{\\lambda} \\cdot \\left(\\frac{Z_{(\\alpha)}}{3\\sqrt{r}} - \\frac{1}{9r} + 1\\right)^3",
    calcular({ params: { r, lambda }, p }: EntradaP<ParamsGamma>) {
      return cuantilWH(p, r, lambda)
    },
    formulaConValores({ params: { r, lambda }, p }: EntradaP<ParamsGamma>, resultado: number) {
      const Z = cuantilNormalEstandar(p)
      return (
        `x_{(${numeroLatex(p)})} \\approx \\frac{${numeroLatex(r)}}{${numeroLatex(lambda)}} ` +
        `\\cdot \\left(\\frac{${numeroLatex(Z)}}{3\\sqrt{${numeroLatex(r)}}} - \\frac{1}{9 \\cdot ${numeroLatex(r)}} + 1\\right)^3 = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 4. Valor dado probabilidad derecha ────────────────────

  valorDadaProbabilidadDerecha: {
    titulo: "Valor dado probabilidad derecha",
    descripcionTeorica:
      "El cuantil derecho es el valor x tal que P(X ≥ x) = p, equivalente al fractil izquierdo " +
      "con probabilidad complementaria 1−p. Se obtiene con Wilson-Hilferty usando Z_(1−p).",
    formulaGeneral:
      "x \\approx \\frac{r}{\\lambda} \\cdot \\left(\\frac{Z_{(1-p)}}{3\\sqrt{r}} - \\frac{1}{9r} + 1\\right)^3",
    calcular({ params: { r, lambda }, p }: EntradaP<ParamsGamma>) {
      return cuantilWH(1 - p, r, lambda)
    },
    formulaConValores({ params: { r, lambda }, p }: EntradaP<ParamsGamma>, resultado: number) {
      const Z = cuantilNormalEstandar(1 - p)
      return (
        `x \\approx \\frac{${numeroLatex(r)}}{${numeroLatex(lambda)}} ` +
        `\\cdot \\left(\\frac{${numeroLatex(Z)}}{3\\sqrt{${numeroLatex(r)}}} - \\frac{1}{9 \\cdot ${numeroLatex(r)}} + 1\\right)^3 = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 5. Expectativa parcial izquierda ──────────────────────

  expectativaParcialIzquierda: {
    titulo: "Expectativa parcial izquierda \n H_γ(x)",
    descripcionTeorica:
      "La expectativa parcial izquierda H_γ(x|r;λ) = ∫₀ˣ t·f(t) dt es la porción de la esperanza " +
      "correspondiente a valores menores o iguales a x. Se expresa elegantemente como " +
      "(r/λ) veces la CDF de una Gamma con forma r+1.",
    formulaGeneral:
      "H_{\\gamma}(x|r;\\lambda) = \\frac{r}{\\lambda} \\cdot F_{\\gamma}(x|r+1;\\lambda)",
    calcular({ params, x }: EntradaX<ParamsGamma>) {
      return hGamma(x, params)
    },
    formulaConValores({ params: { r, lambda }, x }: EntradaX<ParamsGamma>, resultado: number) {
      const F_r1 = gammainc(r + 1, lambda * x)
      return (
        `H_{\\gamma}(${numeroLatex(x)}|${numeroLatex(r)};${numeroLatex(lambda)}) = ` +
        `\\frac{${numeroLatex(r)}}{${numeroLatex(lambda)}} \\cdot F_{\\gamma}(${numeroLatex(x)}|${numeroLatex(r + 1)};${numeroLatex(lambda)}) = ` +
        `\\frac{${numeroLatex(r)}}{${numeroLatex(lambda)}} \\cdot ${numeroLatex(F_r1)} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // ── 6. Expectativa parcial derecha ────────────────────────

  expectativaParcialDerecha: {
    titulo: "Expectativa parcial derecha \n J_γ(x)",
    descripcionTeorica:
      "La expectativa parcial derecha J_γ(x|r;λ) = ∫ₓ^∞ t·f(t) dt es la porción de la esperanza " +
      "correspondiente a valores mayores que x. Se obtiene por complemento: J_γ = E(X) − H_γ.",
    formulaGeneral:
      "J_{\\gamma}(x|r;\\lambda) = E(X) - H_{\\gamma}(x|r;\\lambda) = \\frac{r}{\\lambda} \\cdot G_{\\gamma}(x|r+1;\\lambda)",
    calcular({ params, x }: EntradaX<ParamsGamma>) {
      return params.r / params.lambda - hGamma(x, params)
    },
    formulaConValores({ params: { r, lambda }, x }: EntradaX<ParamsGamma>, resultado: number) {
      const H = hGamma(x, { r, lambda })
      const E = r / lambda
      return (
        `J_{\\gamma}(${numeroLatex(x)}|${numeroLatex(r)};${numeroLatex(lambda)}) = ` +
        `${numeroLatex(E)} - ${numeroLatex(H)} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 7. Promedio truncado izquierdo ─────────────────────────

  promedioTruncadoIzquierdo: {
    titulo: "Promedio truncado izquierdo",
    descripcionTeorica:
      "El promedio truncado izquierdo E[X | X ≤ x] es la media condicional de X dado que X no supera x. " +
      "Se calcula dividiendo la expectativa parcial izquierda H_γ(x) por la probabilidad acumulada F_γ(x).",
    formulaGeneral:
      "E[X \\mid X \\leq x] = \\frac{H_{\\gamma}(x|r;\\lambda)}{F_{\\gamma}(x|r;\\lambda)}",
    calcular({ params, x }: EntradaX<ParamsGamma>) {
      const F = gammainc(params.r, params.lambda * x)
      if (F === 0) return 0
      return hGamma(x, params) / F
    },
    formulaConValores({ params: { r, lambda }, x }: EntradaX<ParamsGamma>, resultado: number) {
      const H = hGamma(x, { r, lambda })
      const F = gammainc(r, lambda * x)
      return (
        `E[X \\mid X \\leq ${numeroLatex(x)}] = ` +
        `\\frac{H_{\\gamma}(${numeroLatex(x)}|${numeroLatex(r)};${numeroLatex(lambda)})}{F_{\\gamma}(${numeroLatex(x)}|${numeroLatex(r)};${numeroLatex(lambda)})} = ` +
        `\\frac{${numeroLatex(H)}}{${numeroLatex(F)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 8. Promedio truncado derecho ───────────────────────────

  promedioTruncadoDerecho: {
    titulo: "Promedio truncado derecho",
    descripcionTeorica:
      "El promedio truncado derecho E[X | X > x] es la media condicional de X dado que X supera x. " +
      "Se calcula dividiendo la expectativa parcial derecha J_γ(x) por la probabilidad de cola G_γ(x).",
    formulaGeneral:
      "E[X \\mid X > x] = \\frac{J_{\\gamma}(x|r;\\lambda)}{G_{\\gamma}(x|r;\\lambda)}",
    calcular({ params, x }: EntradaX<ParamsGamma>) {
      const { r, lambda } = params
      const G = 1 - gammainc(r, lambda * x)
      if (G === 0) return Infinity
      return (r / lambda - hGamma(x, params)) / G
    },
    formulaConValores({ params: { r, lambda }, x }: EntradaX<ParamsGamma>, resultado: number) {
      const H = hGamma(x, { r, lambda })
      const J = r / lambda - H
      const G = 1 - gammainc(r, lambda * x)
      return (
        `E[X \\mid X > ${numeroLatex(x)}] = ` +
        `\\frac{J_{\\gamma}(${numeroLatex(x)}|${numeroLatex(r)};${numeroLatex(lambda)})}{G_{\\gamma}(${numeroLatex(x)}|${numeroLatex(r)};${numeroLatex(lambda)})} = ` +
        `\\frac{${numeroLatex(J)}}{${numeroLatex(G)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 9. Promedio truncado a dos colas ──────────────────────

  promedioTruncadoDosColas: {
    titulo: "Promedio truncado a dos colas",
    descripcionTeorica:
      "El promedio truncado a dos colas E[X | a ≤ X ≤ b] es la media condicional de X en el intervalo [a, b]. " +
      "Se calcula como la diferencia de expectativas parciales dividida por la probabilidad del intervalo.",
    formulaGeneral:
      "E[X \\mid a \\leq X \\leq b] = \\frac{H_{\\gamma}(b|r;\\lambda) - H_{\\gamma}(a|r;\\lambda)}{F_{\\gamma}(b|r;\\lambda) - F_{\\gamma}(a|r;\\lambda)}",
    calcular({ params, a, b }: EntradaDosColas<ParamsGamma>) {
      const { r, lambda } = params
      const denom = gammainc(r, lambda * b) - gammainc(r, lambda * a)
      if (denom === 0) return NaN
      return (hGamma(b, params) - hGamma(a, params)) / denom
    },
    formulaConValores({ params: { r, lambda }, a, b }: EntradaDosColas<ParamsGamma>, resultado: number) {
      const Ha = hGamma(a, { r, lambda })
      const Hb = hGamma(b, { r, lambda })
      const Fa = gammainc(r, lambda * a)
      const Fb = gammainc(r, lambda * b)
      return (
        `E[X \\mid ${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}] = ` +
        `\\frac{H_{\\gamma}(${numeroLatex(b)}|${numeroLatex(r)};${numeroLatex(lambda)}) - H_{\\gamma}(${numeroLatex(a)}|${numeroLatex(r)};${numeroLatex(lambda)})}{F_{\\gamma}(${numeroLatex(b)}|${numeroLatex(r)};${numeroLatex(lambda)}) - F_{\\gamma}(${numeroLatex(a)}|${numeroLatex(r)};${numeroLatex(lambda)})} = ` +
        `\\frac{${numeroLatex(Hb)} - ${numeroLatex(Ha)}}{${numeroLatex(Fb)} - ${numeroLatex(Fa)}} = ${numeroLatex(resultado)}`
      )
    },
  },

  // ── 10. Probabilidad del intervalo ────────────────────────

  probabilidadIntervalo: {
    titulo: "Probabilidad del intervalo \n P(a ≤ X ≤ b)",
    descripcionTeorica:
      "La probabilidad de que X caiga en el intervalo [a, b] se obtiene como la diferencia " +
      "de acumuladas: F_γ(b|r;λ) − F_γ(a|r;λ).",
    formulaGeneral:
      "P(a \\leq X \\leq b) = F_{\\gamma}(b|r;\\lambda) - F_{\\gamma}(a|r;\\lambda)",
    calcular({ params: { r, lambda }, a, b }: EntradaDosColas<ParamsGamma>) {
      return gammainc(r, lambda * b) - gammainc(r, lambda * a)
    },
    formulaConValores({ params: { r, lambda }, a, b }: EntradaDosColas<ParamsGamma>, resultado: number) {
      const Fa = gammainc(r, lambda * a)
      const Fb = gammainc(r, lambda * b)
      return (
        `P(${numeroLatex(a)} \\leq X \\leq ${numeroLatex(b)}) = ` +
        `F_{\\gamma}(${numeroLatex(b)}|${numeroLatex(r)};${numeroLatex(lambda)}) - F_{\\gamma}(${numeroLatex(a)}|${numeroLatex(r)};${numeroLatex(lambda)}) = ` +
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
        if (media <= 0 || desvio <= 0) return null
        const sigma2 = desvio * desvio
        const lambda = media / sigma2
        const r = media * lambda
        return {
          params: { r, lambda },
          pasos: [
            {
              general: "\\lambda = \\frac{\\mu}{\\sigma^2}",
              conValores: `\\lambda = \\frac{${numeroLatex(media)}}{${numeroLatex(sigma2)}} = ${numeroLatex(lambda)}`,
            },
            {
              general: "r = \\frac{\\mu^2}{\\sigma^2} = \\mu \\cdot \\lambda",
              conValores: `r = ${numeroLatex(media)} \\cdot ${numeroLatex(lambda)} = ${numeroLatex(r)}`,
            },
          ],
        }
      },
    },
  ],
}
