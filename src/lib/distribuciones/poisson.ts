// ============================================================
// Distribución de Poisson  X ~ Po(m)
// Parámetro: m = λ·t > 0 (número esperado de eventos)
// Soporte: r ∈ {0, 1, 2, …}
// ============================================================

import type { DistribucionSpec, EntradaDosColas, EntradaP, EntradaX } from "./tipos"
import { numeroLatex } from "./formato"

export type ParamsPoisson = { m: number }

function logFact(n: number): number {
  if (n <= 1) return 0
  let s = 0
  for (let i = 2; i <= n; i++) s += Math.log(i)
  return s
}

function pmf(r: number, m: number): number {
  if (r < 0) return 0
  if (m <= 0) return r === 0 ? 1 : 0
  if (r === 0) return Math.exp(-m)
  return Math.exp(-m + r * Math.log(m) - logFact(r))
}

function cdfLeft(r: number, m: number): number {
  if (r < 0) return 0
  let sum = 0
  for (let x = 0; x <= r; x++) sum += pmf(x, m)
  return Math.min(sum, 1)
}

function cdfRight(r: number, m: number): number {
  // G(r) = P(X ≥ r) = 1 − F(r−1)
  if (r <= 0) return 1
  return Math.max(1 - cdfLeft(r - 1, m), 0)
}

function hPo(r: number, m: number): number {
  // H(r) = Σ_{x=0}^{r} x·pmf(x) = m · F(r−1)
  if (r < 0) return 0
  return m * cdfLeft(r - 1, m)
}

function jPo(r: number, m: number): number {
  // J(r) = Σ_{x=r}^{∞} x·pmf(x) = m · G(r−1)
  return m * cdfRight(r - 1, m)
}

function cuantilIzq(p: number, m: number): number {
  if (p <= 0) return 0
  if (p >= 1) return Infinity
  let r = 0
  let cum = pmf(0, m)
  while (cum < p && r < 100000) {
    r++
    cum += pmf(r, m)
  }
  return r
}

function cuantilDer(p: number, m: number): number {
  // max r tal que G(r) = P(X ≥ r) ≥ p
  if (p <= 0) return Infinity
  if (p >= 1) return 0
  let r = 0
  while (r < 100000) {
    if (cdfRight(r + 1, m) < p) return r
    r++
  }
  return r
}

export const DistribucionPoisson: DistribucionSpec<ParamsPoisson> = {
  slug: "poisson",
  nombre: "Poisson",
  descripcion:
    "La distribución de Poisson modela la cantidad de eventos puntuales que ocurren en un " +
    "continuo (tiempo, longitud, área) de magnitud fija t. " +
    "El parámetro m = λ·t representa el número esperado de eventos en ese continuo.",

  parametros: [{ clave: "m", simbolo: "m", etiqueta: "Parámetro (m = λ·t)", min: 0 }],

  pdf(x, { m }) {
    return pmf(Math.round(x), m)
  },

  cdf(x, { m }) {
    return cdfLeft(Math.floor(x), m)
  },

  cuantil(p, { m }) {
    return cuantilIzq(p, m)
  },

  // ── Esperanza y desvío ─────────────────────────────────────

  esperanza: {
    titulo: "Esperanza matemática\nE(r) = m",
    descripcionTeorica:
      "La esperanza matemática coincide con el parámetro m = λ·t. " +
      "Representa el número medio de eventos en el continuo de observación.",
    formulaGeneral: "E(r) = \\mu = m = \\lambda \\cdot t",
    calcular({ m }) {
      return m
    },
    formulaConValores({ m }, res) {
      return `E(r) = m = ${numeroLatex(res)}`
    },
  },

  desvio: {
    titulo: "Desvío estándar\nσ = √m",
    descripcionTeorica:
      "El desvío estándar σ de la distribución de Poisson es la raíz cuadrada del parámetro m. " +
      "Como la varianza coincide con la media (V(r) = m), el coeficiente de variación decrece a medida que m crece.",
    formulaGeneral: "\\sigma = \\sqrt{m}",
    calcular({ m }) {
      return Math.sqrt(m)
    },
    formulaConValores({ m }, res) {
      return `\\sigma = \\sqrt{${numeroLatex(m)}} = ${numeroLatex(res)}`
    },
  },

  // ── 1. Probabilidad acumulada izquierda ────────────────────

  probabilidadAcumuladaIzquierda: {
    titulo: "Probabilidad acumulada izquierda\nP(X ≤ r) o F(r)",
    descripcionTeorica:
      "La probabilidad acumulada izquierda F(r) = P(X ≤ r) suma las probabilidades puntuales " +
      "desde 0 hasta r inclusive.",
    formulaGeneral:
      "F_{po}(r|m) = P(VA \\leq r) = \\sum_{x=0}^{r} \\frac{e^{-m} \\cdot m^x}{x!}",
    calcular({ params: { m }, x }: EntradaX<ParamsPoisson>) {
      return cdfLeft(Math.floor(x), m)
    },
    formulaConValores({ params: { m }, x }: EntradaX<ParamsPoisson>, res) {
      const r = Math.floor(x)
      return `F_{po}(${r}|${numeroLatex(m)}) = \\sum_{x=0}^{${r}} \\frac{e^{-${numeroLatex(m)}} \\cdot ${numeroLatex(m)}^x}{x!} = ${numeroLatex(res)}`
    },
  },

  // ── 2. Probabilidad acumulada derecha ──────────────────────

  probabilidadAcumuladaDerecha: {
    titulo: "Probabilidad acumulada derecha\nP(X ≥ r) o G(r)",
    descripcionTeorica:
      "La probabilidad acumulada derecha G(r) = P(X ≥ r) es el complemento de la CDF hasta r−1: G(r) = 1 − F(r−1).",
    formulaGeneral:
      "G_{po}(r|m) = P(VA \\geq r) = 1 - F_{po}(r-1|m) = \\sum_{x=r}^{\\infty} \\frac{e^{-m} \\cdot m^x}{x!}",
    calcular({ params: { m }, x }: EntradaX<ParamsPoisson>) {
      return cdfRight(Math.floor(x), m)
    },
    formulaConValores({ params: { m }, x }: EntradaX<ParamsPoisson>, res) {
      const r = Math.floor(x)
      return `G_{po}(${r}|${numeroLatex(m)}) = 1 - F_{po}(${r - 1}|${numeroLatex(m)}) = ${numeroLatex(res)}`
    },
  },

  // ── 3. Valor dado probabilidad izquierda ───────────────────

  valorDadaProbabilidadIzquierda: {
    titulo: "Valor dado probabilidad izquierda\nFractil r_(α)",
    descripcionTeorica:
      "El fractil r_(α) es el menor entero r tal que F(r|m) ≥ α. " +
      "Se determina iterando la CDF de izquierda a derecha hasta alcanzar la probabilidad requerida.",
    formulaGeneral:
      "r_{(\\alpha)} = \\min\\{r \\in \\mathbb{N}_0 : F_{po}(r|m) \\geq \\alpha\\}",
    calcular({ params: { m }, p }: EntradaP<ParamsPoisson>) {
      return cuantilIzq(p, m)
    },
    formulaConValores({ params: { m }, p }: EntradaP<ParamsPoisson>, res) {
      return `r_{(${numeroLatex(p)})} = \\min\\{r : F_{po}(r|${numeroLatex(m)}) \\geq ${numeroLatex(p)}\\} = ${Math.round(res)}`
    },
  },

  // ── 4. Valor dado probabilidad derecha ─────────────────────

  valorDadaProbabilidadDerecha: {
    titulo: "Valor dado probabilidad derecha",
    descripcionTeorica:
      "El cuantil derecho es el mayor entero r tal que G(r|m) = P(X ≥ r) ≥ p. " +
      "Se determina iterando la CDF hasta encontrar el punto de cruce.",
    formulaGeneral:
      "r = \\max\\{r \\in \\mathbb{N}_0 : G_{po}(r|m) \\geq p\\}",
    calcular({ params: { m }, p }: EntradaP<ParamsPoisson>) {
      return cuantilDer(p, m)
    },
    formulaConValores({ params: { m }, p }: EntradaP<ParamsPoisson>, res) {
      return `r = \\max\\{r : G_{po}(r|${numeroLatex(m)}) \\geq ${numeroLatex(p)}\\} = ${Math.round(res)}`
    },
  },

  // ── 5. Expectativa parcial izquierda ──────────────────────

  expectativaParcialIzquierda: {
    titulo: "Expectativa parcial izquierda\nH(r)",
    descripcionTeorica:
      "La expectativa parcial izquierda H(r) = Σ_{x=0}^{r} x·P(X=x) es la porción de la esperanza " +
      "correspondiente a los valores de 0 a r. " +
      "Para Poisson admite la forma cerrada H(r) = m · F(r−1|m).",
    formulaGeneral:
      "H_{po}(r|m) = \\sum_{x=0}^{r} x \\cdot \\frac{e^{-m} m^x}{x!} = m \\cdot F_{po}(r-1|m)",
    calcular({ params: { m }, x }: EntradaX<ParamsPoisson>) {
      return hPo(Math.floor(x), m)
    },
    formulaConValores({ params: { m }, x }: EntradaX<ParamsPoisson>, res) {
      const r = Math.floor(x)
      const Frm1 = cdfLeft(r - 1, m)
      return (
        `H_{po}(${r}|${numeroLatex(m)}) = ${numeroLatex(m)} \\cdot F_{po}(${r - 1}|${numeroLatex(m)}) = ` +
        `${numeroLatex(m)} \\cdot ${numeroLatex(Frm1)} = ${numeroLatex(res)}`
      )
    },
  },

  // ── 6. Expectativa parcial derecha ────────────────────────

  expectativaParcialDerecha: {
    titulo: "Expectativa parcial derecha\nJ(r)",
    descripcionTeorica:
      "La expectativa parcial derecha J(r) = Σ_{x=r}^{∞} x·P(X=x) es la porción de la esperanza " +
      "correspondiente a los valores desde r en adelante. " +
      "Para Poisson se calcula como J(r) = m · G(r−1|m) = E(X) − H(r−1|m).",
    formulaGeneral:
      "J_{po}(r|m) = \\sum_{x=r}^{\\infty} x \\cdot \\frac{e^{-m} m^x}{x!} = m \\cdot G_{po}(r-1|m)",
    calcular({ params: { m }, x }: EntradaX<ParamsPoisson>) {
      return jPo(Math.floor(x), m)
    },
    formulaConValores({ params: { m }, x }: EntradaX<ParamsPoisson>, res) {
      const r = Math.floor(x)
      const Grm1 = cdfRight(r - 1, m)
      return (
        `J_{po}(${r}|${numeroLatex(m)}) = ${numeroLatex(m)} \\cdot G_{po}(${r - 1}|${numeroLatex(m)}) = ` +
        `${numeroLatex(m)} \\cdot ${numeroLatex(Grm1)} = ${numeroLatex(res)}`
      )
    },
  },

  // ── 7. Promedio truncado izquierdo ─────────────────────────

  promedioTruncadoIzquierdo: {
    titulo: "Promedio truncado izquierdo",
    descripcionTeorica:
      "El promedio truncado izquierdo E[X | X ≤ r] es la media condicional de X dado que X no supera r. " +
      "Se obtiene dividiendo la expectativa parcial izquierda H(r) entre la probabilidad acumulada F(r).",
    formulaGeneral:
      "E[X \\mid X \\leq r] = \\frac{H_{po}(r|m)}{F_{po}(r|m)}",
    calcular({ params: { m }, x }: EntradaX<ParamsPoisson>) {
      const r = Math.floor(x)
      const F = cdfLeft(r, m)
      if (F === 0) return NaN
      return hPo(r, m) / F
    },
    formulaConValores({ params: { m }, x }: EntradaX<ParamsPoisson>, res) {
      const r = Math.floor(x)
      const H = hPo(r, m)
      const F = cdfLeft(r, m)
      return `E[X \\mid X \\leq ${r}] = \\frac{${numeroLatex(H)}}{${numeroLatex(F)}} = ${numeroLatex(res)}`
    },
  },

  // ── 8. Promedio truncado derecho ───────────────────────────

  promedioTruncadoDerecho: {
    titulo: "Promedio truncado derecho",
    descripcionTeorica:
      "El promedio truncado derecho E[X | X ≥ r] es la media condicional de X dado que X supera o iguala r. " +
      "Se obtiene dividiendo la expectativa parcial derecha J(r) entre la probabilidad G(r).",
    formulaGeneral:
      "E[X \\mid X \\geq r] = \\frac{J_{po}(r|m)}{G_{po}(r|m)}",
    calcular({ params: { m }, x }: EntradaX<ParamsPoisson>) {
      const r = Math.floor(x)
      const G = cdfRight(r, m)
      if (G === 0) return NaN
      return jPo(r, m) / G
    },
    formulaConValores({ params: { m }, x }: EntradaX<ParamsPoisson>, res) {
      const r = Math.floor(x)
      const J = jPo(r, m)
      const G = cdfRight(r, m)
      return `E[X \\mid X \\geq ${r}] = \\frac{${numeroLatex(J)}}{${numeroLatex(G)}} = ${numeroLatex(res)}`
    },
  },

  // ── 9. Promedio truncado a dos colas ──────────────────────

  promedioTruncadoDosColas: {
    titulo: "Promedio truncado a dos colas",
    descripcionTeorica:
      "El promedio truncado a dos colas E[X | a ≤ X ≤ b] es la media condicional de X en el intervalo entero [a, b]. " +
      "Se calcula como la diferencia de expectativas parciales dividida por la probabilidad del intervalo.",
    formulaGeneral:
      "E[X \\mid a \\leq X \\leq b] = \\frac{H_{po}(b|m) - H_{po}(a-1|m)}{F_{po}(b|m) - F_{po}(a-1|m)}",
    calcular({ params: { m }, a, b }: EntradaDosColas<ParamsPoisson>) {
      const ai = Math.floor(a)
      const bi = Math.floor(b)
      const denom = cdfLeft(bi, m) - cdfLeft(ai - 1, m)
      if (denom === 0) return NaN
      return (hPo(bi, m) - hPo(ai - 1, m)) / denom
    },
    formulaConValores({ params: { m }, a, b }: EntradaDosColas<ParamsPoisson>, res) {
      const ai = Math.floor(a)
      const bi = Math.floor(b)
      const Hb = hPo(bi, m)
      const Ham1 = hPo(ai - 1, m)
      const Fb = cdfLeft(bi, m)
      const Fam1 = cdfLeft(ai - 1, m)
      return (
        `E[X \\mid ${ai} \\leq X \\leq ${bi}] = ` +
        `\\frac{H_{po}(${bi}|${numeroLatex(m)}) - H_{po}(${ai - 1}|${numeroLatex(m)})}{F_{po}(${bi}|${numeroLatex(m)}) - F_{po}(${ai - 1}|${numeroLatex(m)})} = ` +
        `\\frac{${numeroLatex(Hb)} - ${numeroLatex(Ham1)}}{${numeroLatex(Fb)} - ${numeroLatex(Fam1)}} = ${numeroLatex(res)}`
      )
    },
  },

  // ── 10. Probabilidad del intervalo ────────────────────────

  probabilidadIntervalo: {
    titulo: "Probabilidad del intervalo\nP(a ≤ X ≤ b)",
    descripcionTeorica:
      "La probabilidad de que X caiga en el intervalo entero [a, b] se obtiene como " +
      "la diferencia de acumuladas: F(b|m) − F(a−1|m).",
    formulaGeneral:
      "P(a \\leq X \\leq b) = F_{po}(b|m) - F_{po}(a-1|m)",
    calcular({ params: { m }, a, b }: EntradaDosColas<ParamsPoisson>) {
      return cdfLeft(Math.floor(b), m) - cdfLeft(Math.floor(a) - 1, m)
    },
    formulaConValores({ params: { m }, a, b }: EntradaDosColas<ParamsPoisson>, res) {
      const ai = Math.floor(a)
      const bi = Math.floor(b)
      const Fb = cdfLeft(bi, m)
      const Fam1 = cdfLeft(ai - 1, m)
      return (
        `P(${ai} \\leq X \\leq ${bi}) = F_{po}(${bi}|${numeroLatex(m)}) - F_{po}(${ai - 1}|${numeroLatex(m)}) = ` +
        `${numeroLatex(Fb)} - ${numeroLatex(Fam1)} = ${numeroLatex(res)}`
      )
    },
  },

  derivacionesDeParametros: [
    {
      etiquetaBoton: "Desde λ y t",
      inputs: [
        { etiqueta: "Tasa (λ)", placeholder: "λ", min: 0 },
        { etiqueta: "Continuo (t)", placeholder: "t", min: 0 },
      ],
      derivar([lambda, t]) {
        if (lambda <= 0 || t <= 0) return null
        const m = lambda * t
        return {
          params: { m },
          pasos: [
            {
              general: "m = \\lambda \\cdot t",
              conValores: `m = ${numeroLatex(lambda)} \\cdot ${numeroLatex(t)} = ${numeroLatex(m)}`,
            },
          ],
        }
      },
    },
  ],
}
