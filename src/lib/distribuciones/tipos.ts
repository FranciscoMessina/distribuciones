// ============================================================
// Contratos compartidos para todas las distribuciones
// ============================================================

/** Par de fórmulas LaTeX: con variables generales y con valores sustituidos */
export type FormulaRender = {
  general: string
  conValores: string
}

// ── Tipos de entrada para cada categoría de cálculo ─────────

/** Entrada que toma un valor x de la distribución */
export type EntradaX<P> = { params: P; x: number }

/** Entrada que toma una probabilidad p ∈ (0, 1) */
export type EntradaP<P> = { params: P; p: number }

/** Entrada que toma dos extremos del intervalo de truncación */
export type EntradaDosColas<P> = { params: P; a: number; b: number }

// ── Cálculo que sólo depende de los parámetros ──────────────

/** Como Calculo pero sin entrada: el valor se deriva únicamente de los parámetros */
export type CalculoSinEntrada<P> = {
  titulo: string
  descripcionTeorica: string
  formulaGeneral: string
  calcular: (params: P) => number
  formulaConValores: (params: P, resultado: number) => string
}

// ── Bloque co-localizado de un cálculo ───────────────────────

/**
 * Todo lo relacionado con un cálculo específico, agrupado:
 * - `titulo`: nombre legible del cálculo
 * - `descripcionTeorica`: explicación en lenguaje natural (Markdown simple)
 * - `formulaGeneral`: LaTeX con variables simbólicas (estático, sin valores)
 * - `calcular`: función PURA que recibe todos los datos por parámetro
 * - `formulaConValores`: LaTeX con los valores concretos sustituidos
 *
 * Ejemplo de acceso:
 *   DistribucionNormal.expectativaParcialIzquierda.calcular({ params, x })
 *   DistribucionNormal.expectativaParcialIzquierda.formulaGeneral
 *   DistribucionNormal.expectativaParcialIzquierda.descripcionTeorica
 */
export type Calculo<TInput> = {
  titulo: string
  descripcionTeorica: string
  formulaGeneral: string
  calcular: (input: TInput) => number
  formulaConValores: (input: TInput, resultado: number) => string
}

// ── Definición de parámetro de la distribución ───────────────

export type ParametroDef = {
  /** Clave del objeto params, e.g. "mu" */
  clave: string
  /** Símbolo matemático, e.g. "μ" */
  simbolo: string
  /** Etiqueta para el input, e.g. "Media (μ)" */
  etiqueta: string
  /** Restricciones opcionales para la validación de inputs */
  min?: number
  max?: number
}

// ── Derivación de parámetros ─────────────────────────────────

export type InputDerivacion = {
  etiqueta: string
  placeholder: string
  min?: number
  max?: number
}

/**
 * Una forma alternativa de ingresar parámetros mediante valores derivados.
 * Cada entrada en `derivacionesDeParametros` genera un toggle extra en el panel.
 */
export type DerivacionDeParametros<P> = {
  etiquetaBoton: string
  inputs: InputDerivacion[]
  derivar: (vals: number[]) => { params: P; pasos: FormulaRender[] } | null
}

// ── Spec completo de una distribución ────────────────────────

export type DistribucionSpec<P> = {
  slug: string
  nombre: string
  /** Descripción general de la distribución */
  descripcion: string
  /** Definición de los parámetros nativos */
  parametros: ParametroDef[]

  // Primitivas de la distribución
  pdf: (x: number, params: P) => number
  cdf: (x: number, params: P) => number
  cuantil: (prob: number, params: P) => number

  // Los 9 cálculos co-localizados con su matemática, fórmulas y teoría
  probabilidadAcumuladaIzquierda: Calculo<EntradaX<P>>
  probabilidadAcumuladaDerecha: Calculo<EntradaX<P>>
  valorDadaProbabilidadIzquierda: Calculo<EntradaP<P>>
  valorDadaProbabilidadDerecha: Calculo<EntradaP<P>>
  expectativaParcialIzquierda: Calculo<EntradaX<P>>
  expectativaParcialDerecha: Calculo<EntradaX<P>>
  promedioTruncadoIzquierdo: Calculo<EntradaX<P>>
  promedioTruncadoDerecho: Calculo<EntradaX<P>>
  promedioTruncadoDosColas: Calculo<EntradaDosColas<P>>

  /** Esperanza matemática E[X], calculada sólo a partir de los parámetros */
  esperanza?: CalculoSinEntrada<P>

  /** Desvío estándar σ[X], calculado sólo a partir de los parámetros */
  desvio?: CalculoSinEntrada<P>

  /** P(a ≤ X ≤ b): probabilidad de que X caiga en el intervalo de truncación */
  probabilidadIntervalo?: Calculo<EntradaDosColas<P>>

  /**
   * Formas alternativas de ingresar los parámetros de la distribución.
   * Cada entrada genera un toggle extra en el panel de parámetros.
   * Si no se provee (o el array está vacío), sólo aparece el modo nativo.
   */
  derivacionesDeParametros?: DerivacionDeParametros<P>[]
}
