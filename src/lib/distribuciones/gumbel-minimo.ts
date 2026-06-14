// ============================================================
// Distribución Gumbel mínimo  X ~ GumbelMin(μ, β)
// Parámetros: μ ∈ ℝ (ubicación), β > 0 (escala)
// Soporte: x ∈ (−∞, +∞)
// Usada para modelar mínimos de muestras grandes.
//
// TODO: completar expectativas parciales y promedios truncados.
// ============================================================

import type { DistribucionSpec, EntradaDosColas, EntradaP, EntradaX } from "./tipos"
import { EULER_MASCHERONI } from "./matematica"
import { numeroLatex } from "./formato"

export type ParamsGumbelMinimo = { mu: number; beta: number }

const TODO_TEORIA = "Descripción teórica pendiente."
const TODO_FORMULA = "\\text{(fórmula pendiente)}"

function zG(x: number, mu: number, beta: number) {
  return (x - mu) / beta
}

export const DistribucionGumbelMinimo: DistribucionSpec<ParamsGumbelMinimo> = {
  slug: "gumbel-minimo",
  nombre: "Gumbel mínimo",
  descripcion:
    "La distribución de Gumbel para mínimos modela el valor extremo mínimo. " +
    "Es el reflejo de la Gumbel para máximos: si X ~ Gumbel máximo, entonces −X ~ Gumbel mínimo.",

  parametros: [
    { clave: "mu", simbolo: "μ", etiqueta: "Ubicación (μ)" },
    { clave: "beta", simbolo: "β", etiqueta: "Escala (β)", min: 0 },
  ],

  pdf(x, { mu, beta }) {
    const z = zG(x, mu, beta)
    return (1 / beta) * Math.exp(z - Math.exp(z))
  },

  cdf(x, { mu, beta }) {
    return 1 - Math.exp(-Math.exp(zG(x, mu, beta)))
  },

  cuantil(p, { mu, beta }) {
    return mu + beta * Math.log(-Math.log(1 - p))
  },

  probabilidadAcumuladaIzquierda: {
    titulo: "Probabilidad acumulada izquierda",
    descripcionTeorica: TODO_TEORIA,
    formulaGeneral: "P(X \\leq x) = 1 - e^{-e^{(x-\\mu)/\\beta}}",
    calcular({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMinimo>) {
      return 1 - Math.exp(-Math.exp(zG(x, mu, beta)))
    },
    formulaConValores({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMinimo>, resultado: number) {
      const z = zG(x, mu, beta)
      return `P(X \\leq ${numeroLatex(x)}) = 1 - e^{-e^{${numeroLatex(z)}}} = ${numeroLatex(resultado)}`
    },
  },

  probabilidadAcumuladaDerecha: {
    titulo: "Probabilidad acumulada derecha",
    descripcionTeorica: TODO_TEORIA,
    formulaGeneral: "P(X > x) = e^{-e^{(x-\\mu)/\\beta}}",
    calcular({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMinimo>) {
      return Math.exp(-Math.exp(zG(x, mu, beta)))
    },
    formulaConValores({ params: { mu, beta }, x }: EntradaX<ParamsGumbelMinimo>, resultado: number) {
      const z = zG(x, mu, beta)
      return `P(X > ${numeroLatex(x)}) = e^{-e^{${numeroLatex(z)}}} = ${numeroLatex(resultado)}`
    },
  },

  valorDadaProbabilidadIzquierda: {
    titulo: "Valor dado probabilidad izquierda",
    descripcionTeorica: TODO_TEORIA,
    formulaGeneral: "x = \\mu + \\beta \\ln(-\\ln(1-p))",
    calcular({ params: { mu, beta }, p }: EntradaP<ParamsGumbelMinimo>) {
      return mu + beta * Math.log(-Math.log(1 - p))
    },
    formulaConValores({ params: { mu, beta }, p }: EntradaP<ParamsGumbelMinimo>, resultado: number) {
      return `x = ${numeroLatex(mu)} + ${numeroLatex(beta)} \\ln(-\\ln(1 - ${numeroLatex(p)})) = ${numeroLatex(resultado)}`
    },
  },

  valorDadaProbabilidadDerecha: {
    titulo: "Valor dado probabilidad derecha",
    descripcionTeorica: TODO_TEORIA,
    formulaGeneral: "x = \\mu + \\beta \\ln(-\\ln p)",
    calcular({ params: { mu, beta }, p }: EntradaP<ParamsGumbelMinimo>) {
      return mu + beta * Math.log(-Math.log(p))
    },
    formulaConValores({ params: { mu, beta }, p }: EntradaP<ParamsGumbelMinimo>, resultado: number) {
      return `x = ${numeroLatex(mu)} + ${numeroLatex(beta)} \\ln(-\\ln ${numeroLatex(p)}) = ${numeroLatex(resultado)}`
    },
  },

  expectativaParcialIzquierda: {
    titulo: "Expectativa parcial izquierda",
    descripcionTeorica: TODO_TEORIA,
    formulaGeneral: TODO_FORMULA,
    calcular(_: EntradaX<ParamsGumbelMinimo>) { return NaN },
    formulaConValores(_: EntradaX<ParamsGumbelMinimo>, r: number) { return `${numeroLatex(r)}` },
  },

  expectativaParcialDerecha: {
    titulo: "Expectativa parcial derecha",
    descripcionTeorica: TODO_TEORIA,
    formulaGeneral: TODO_FORMULA,
    calcular(_: EntradaX<ParamsGumbelMinimo>) { return NaN },
    formulaConValores(_: EntradaX<ParamsGumbelMinimo>, r: number) { return `${numeroLatex(r)}` },
  },

  promedioTruncadoIzquierdo: {
    titulo: "Promedio truncado izquierdo",
    descripcionTeorica: TODO_TEORIA,
    formulaGeneral: TODO_FORMULA,
    calcular(_: EntradaX<ParamsGumbelMinimo>) { return NaN },
    formulaConValores(_: EntradaX<ParamsGumbelMinimo>, r: number) { return `${numeroLatex(r)}` },
  },

  promedioTruncadoDerecho: {
    titulo: "Promedio truncado derecho",
    descripcionTeorica: TODO_TEORIA,
    formulaGeneral: TODO_FORMULA,
    calcular(_: EntradaX<ParamsGumbelMinimo>) { return NaN },
    formulaConValores(_: EntradaX<ParamsGumbelMinimo>, r: number) { return `${numeroLatex(r)}` },
  },

  promedioTruncadoDosColas: {
    titulo: "Promedio truncado a dos colas",
    descripcionTeorica: TODO_TEORIA,
    formulaGeneral: TODO_FORMULA,
    calcular(_: EntradaDosColas<ParamsGumbelMinimo>) { return NaN },
    formulaConValores(_: EntradaDosColas<ParamsGumbelMinimo>, r: number) { return `${numeroLatex(r)}` },
  },

  derivacionesDeParametros: [
    {
      etiquetaBoton: "Media y desvío",
      inputs: [
        { etiqueta: "Media", placeholder: "μ" },
        { etiqueta: "Desv. estándar", placeholder: "σ", min: 0 },
      ],
      derivar([media, desvio]) {
        // Para Gumbel mínimo: media = μ − β·γ, desv = π·β/√6
        const beta = (desvio * Math.sqrt(6)) / Math.PI
        const mu = media + beta * EULER_MASCHERONI
        return {
          params: { mu, beta },
          pasos: [
            {
              general: "\\beta = \\frac{\\sigma \\sqrt{6}}{\\pi}",
              conValores: `\\beta = \\frac{${numeroLatex(desvio)} \\cdot \\sqrt{6}}{\\pi} = ${numeroLatex(beta)}`,
            },
            {
              general: "\\mu = \\bar{x} + \\beta \\cdot \\gamma",
              conValores: `\\mu = ${numeroLatex(media)} + ${numeroLatex(beta)} \\cdot ${numeroLatex(EULER_MASCHERONI)} = ${numeroLatex(mu)}`,
            },
          ],
        }
      },
    },
  ],
}
