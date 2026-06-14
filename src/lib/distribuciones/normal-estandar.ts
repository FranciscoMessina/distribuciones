// ============================================================
// Distribución Normal Estándar  Z ~ N(0, 1)
// Caso especial de Normal con μ = 0, σ = 1.
// Sin parámetros libres.
// ============================================================

import type { DistribucionSpec, EntradaDosColas, EntradaP, EntradaX } from "./tipos"
import { phi, Phi, cuantilNormalEstandar } from "./matematica"
import { numeroLatex } from "./formato"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ParamsNormalEstandar = Record<string, never>

export const DistribucionNormalEstandar: DistribucionSpec<ParamsNormalEstandar> = {
  slug: "normal-estandar",
  nombre: "Normal estándar",
  descripcion:
    "La distribución normal estándar Z ~ N(0, 1) es el caso especial con media 0 y " +
    "desviación estándar 1. Es la base de la tabla Z y de los z-scores.",

  parametros: [],

  pdf(x) {
    return phi(x)
  },

  cdf(x) {
    return Phi(x)
  },

  cuantil(p) {
    return cuantilNormalEstandar(p)
  },

  probabilidadAcumuladaIzquierda: {
    titulo: "Probabilidad acumulada izquierda",
    descripcionTeorica:
      "P(Z ≤ z) es el área bajo la curva normal estándar desde −∞ hasta z. " +
      "Es el valor que se lee directamente en la tabla Z.",

    formulaGeneral: "P(Z \\leq z) = \\Phi(z)",

    calcular({ x }: EntradaX<ParamsNormalEstandar>) {
      return Phi(x)
    },

    formulaConValores({ x }: EntradaX<ParamsNormalEstandar>, resultado: number) {
      return `P(Z \\leq ${numeroLatex(x)}) = \\Phi(${numeroLatex(x)}) = ${numeroLatex(resultado)}`
    },
  },

  probabilidadAcumuladaDerecha: {
    titulo: "Probabilidad acumulada derecha",
    descripcionTeorica: "P(Z > z) = 1 − Φ(z), el área a la derecha del valor z.",

    formulaGeneral: "P(Z > z) = 1 - \\Phi(z)",

    calcular({ x }: EntradaX<ParamsNormalEstandar>) {
      return 1 - Phi(x)
    },

    formulaConValores({ x }: EntradaX<ParamsNormalEstandar>, resultado: number) {
      return `P(Z > ${numeroLatex(x)}) = 1 - \\Phi(${numeroLatex(x)}) = ${numeroLatex(resultado)}`
    },
  },

  valorDadaProbabilidadIzquierda: {
    titulo: "Valor dado probabilidad izquierda",
    descripcionTeorica: "Cuantil z tal que P(Z ≤ z) = p. Es la inversa de la función Φ.",

    formulaGeneral: "z = \\Phi^{-1}(p)",

    calcular({ p }: EntradaP<ParamsNormalEstandar>) {
      return cuantilNormalEstandar(p)
    },

    formulaConValores({ p }: EntradaP<ParamsNormalEstandar>, resultado: number) {
      return `z = \\Phi^{-1}(${numeroLatex(p)}) = ${numeroLatex(resultado)}`
    },
  },

  valorDadaProbabilidadDerecha: {
    titulo: "Valor dado probabilidad derecha",
    descripcionTeorica: "Cuantil z tal que P(Z > z) = p, equivalente a Φ⁻¹(1 − p).",

    formulaGeneral: "z = \\Phi^{-1}(1 - p)",

    calcular({ p }: EntradaP<ParamsNormalEstandar>) {
      return cuantilNormalEstandar(1 - p)
    },

    formulaConValores({ p }: EntradaP<ParamsNormalEstandar>, resultado: number) {
      return `z = \\Phi^{-1}(1 - ${numeroLatex(p)}) = ${numeroLatex(resultado)}`
    },
  },

  expectativaParcialIzquierda: {
    titulo: "Expectativa parcial izquierda",
    descripcionTeorica:
      "E[Z; Z ≤ z] = −φ(z). Para la normal estándar la expectativa parcial izquierda " +
      "es simplemente el negativo de la densidad evaluada en z.",

    formulaGeneral: "E[Z;\\, Z \\leq z] = -\\phi(z)",

    calcular({ x }: EntradaX<ParamsNormalEstandar>) {
      return -phi(x)
    },

    formulaConValores({ x }: EntradaX<ParamsNormalEstandar>, resultado: number) {
      return `E[Z;\\, Z \\leq ${numeroLatex(x)}] = -\\phi(${numeroLatex(x)}) = ${numeroLatex(resultado)}`
    },
  },

  expectativaParcialDerecha: {
    titulo: "Expectativa parcial derecha",
    descripcionTeorica:
      "E[Z; Z > z] = φ(z). La suma con la izquierda es 0 = E[Z].",

    formulaGeneral: "E[Z;\\, Z > z] = \\phi(z)",

    calcular({ x }: EntradaX<ParamsNormalEstandar>) {
      return phi(x)
    },

    formulaConValores({ x }: EntradaX<ParamsNormalEstandar>, resultado: number) {
      return `E[Z;\\, Z > ${numeroLatex(x)}] = \\phi(${numeroLatex(x)}) = ${numeroLatex(resultado)}`
    },
  },

  promedioTruncadoIzquierdo: {
    titulo: "Promedio truncado izquierdo",
    descripcionTeorica:
      "E[Z | Z ≤ z] = −φ(z)/Φ(z). Es la razón inversa de Mills con signo negativo.",

    formulaGeneral: "E[Z \\mid Z \\leq z] = -\\frac{\\phi(z)}{\\Phi(z)}",

    calcular({ x }: EntradaX<ParamsNormalEstandar>) {
      const PhiZ = Phi(x)
      if (PhiZ === 0) return -Infinity
      return -phi(x) / PhiZ
    },

    formulaConValores({ x }: EntradaX<ParamsNormalEstandar>, resultado: number) {
      return `E[Z \\mid Z \\leq ${numeroLatex(x)}] = -\\frac{\\phi(${numeroLatex(x)})}{\\Phi(${numeroLatex(x)})} = ${numeroLatex(resultado)}`
    },
  },

  promedioTruncadoDerecho: {
    titulo: "Promedio truncado derecho",
    descripcionTeorica:
      "E[Z | Z > z] = φ(z)/(1−Φ(z)). Es la razón de Mills, usada en modelos de selección.",

    formulaGeneral: "E[Z \\mid Z > z] = \\frac{\\phi(z)}{1 - \\Phi(z)}",

    calcular({ x }: EntradaX<ParamsNormalEstandar>) {
      const survZ = 1 - Phi(x)
      if (survZ === 0) return Infinity
      return phi(x) / survZ
    },

    formulaConValores({ x }: EntradaX<ParamsNormalEstandar>, resultado: number) {
      return `E[Z \\mid Z > ${numeroLatex(x)}] = \\frac{\\phi(${numeroLatex(x)})}{1 - \\Phi(${numeroLatex(x)})} = ${numeroLatex(resultado)}`
    },
  },

  promedioTruncadoDosColas: {
    titulo: "Promedio truncado a dos colas",
    descripcionTeorica:
      "E[Z | a ≤ Z ≤ b] = (φ(a) − φ(b)) / (Φ(b) − Φ(a)). " +
      "Para la normal estándar la fórmula usa directamente φ y Φ en los extremos.",

    formulaGeneral:
      "E[Z \\mid a \\leq Z \\leq b] = \\frac{\\phi(a) - \\phi(b)}{\\Phi(b) - \\Phi(a)}",

    calcular({ a, b }: EntradaDosColas<ParamsNormalEstandar>) {
      const denom = Phi(b) - Phi(a)
      if (denom === 0) return NaN
      return (phi(a) - phi(b)) / denom
    },

    formulaConValores({ a, b }: EntradaDosColas<ParamsNormalEstandar>, resultado: number) {
      return (
        `E[Z \\mid ${numeroLatex(a)} \\leq Z \\leq ${numeroLatex(b)}] = ` +
        `\\frac{\\phi(${numeroLatex(a)}) - \\phi(${numeroLatex(b)})}{\\Phi(${numeroLatex(b)}) - \\Phi(${numeroLatex(a)})} = ` +
        `${numeroLatex(resultado)}`
      )
    },
  },

  // Normal estándar no tiene parámetros que derivar desde media/desvío
  // (siempre μ = 0, σ = 1)
}
