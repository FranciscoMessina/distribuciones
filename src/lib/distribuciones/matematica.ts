// ============================================================
// Funciones matemáticas puras compartidas entre distribuciones
// Todas reciben sus datos por parámetro, sin estado global.
// ============================================================

export const SQRT_2PI = Math.sqrt(2 * Math.PI)
export const SQRT2 = Math.SQRT2
// biome-ignore lint/correctness/noPrecisionLoss: pesado
// eslint-disable-next-line no-loss-of-precision
export const EULER_MASCHERONI = 0.5772156649015328606

// ── Normal / erf ─────────────────────────────────────────────

/**
 * Función error (erf) usando la aproximación de Abramowitz & Stegun 7.1.26.
 * Error máximo: 1.5×10⁻⁷
 */
export function erf(x: number): number {
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-x * x)
  return x >= 0 ? y : -y
}

/** Densidad normal estándar φ(z) = (1/√(2π)) · exp(−z²/2) */
export function phi(z: number): number {
  return Math.exp(-0.5 * z * z) / SQRT_2PI
}

/** Acumulada normal estándar Φ(z) = P(Z ≤ z) */
export function Phi(z: number): number {
  return 0.5 * (1 + erf(z / SQRT2))
}

/**
 * Cuantil de la normal estándar Φ⁻¹(p) usando la aproximación racional
 * de P. J. Acklam. Precisión: error máximo ~1.15×10⁻⁹.
 */
export function cuantilNormalEstandar(p: number): number {
  if (p <= 0) return -Infinity
  if (p >= 1) return Infinity

  const a = [
    -3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2,
    1.38357751867269e2, -3.066479806614716e1, 2.506628277459239,
  ]
  const b = [
    -5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2,
    6.680131188771972e1, -1.328068155288572e1,
  ]
  const c = [
    -7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838,
    -2.549732539343734, 4.374664141464968, 2.938163982698783,
  ]
  const d = [
    7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996,
    3.754408661907416,
  ]

  const pLow = 0.02425
  const pHigh = 1 - pLow
  let q: number, r: number

  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p))
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  } else if (p <= pHigh) {
    q = p - 0.5
    r = q * q
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    )
  } else {
    q = Math.sqrt(-2 * Math.log(1 - p))
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    )
  }
}

// ── Función Gamma y derivados ────────────────────────────────
// (Se irán completando a medida que se agreguen distribuciones)

/**
 * Logaritmo de la función Gamma usando la aproximación de Lanczos.
 * Válido para x > 0.
 */
export function gammaln(x: number): number {
  const g = 7
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  if (x < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * x)) - gammaln(1 - x)
  }
  const xr = x - 1
  const t = xr + g + 0.5
  let s = c[0]
  for (let i = 1; i < g + 2; i++) {
    s += c[i] / (xr + i)
  }
  return (
    0.5 * Math.log(2 * Math.PI) + (xr + 0.5) * Math.log(t) - t + Math.log(s)
  )
}

/** Función Gamma Γ(x) = exp(gammaln(x)) */
export function gamma(x: number): number {
  return Math.exp(gammaln(x))
}

// Expansión en serie para P(a,x) cuando x < a+1
function gammaincSeries(a: number, x: number): number {
  let term = 1.0 / a
  let sum = term
  for (let n = 1; n <= 300; n++) {
    term *= x / (a + n)
    sum += term
    if (term < sum * 1e-12) break
  }
  return Math.exp(-x + a * Math.log(x) - gammaln(a)) * sum
}

// Fracción continua para Q(a,x) = 1 - P(a,x) cuando x >= a+1 (método de Lentz)
function gammaincCF(a: number, x: number): number {
  const FPMIN = 1e-300
  let b = x + 1 - a
  let c = 1 / FPMIN
  let d = 1 / b
  let h = d
  for (let i = 1; i <= 300; i++) {
    const an = -i * (i - a)
    b += 2
    d = an * d + b
    if (Math.abs(d) < FPMIN) d = FPMIN
    c = b + an / c
    if (Math.abs(c) < FPMIN) c = FPMIN
    d = 1 / d
    const del = d * c
    h *= del
    if (Math.abs(del - 1) < 1e-12) break
  }
  return Math.exp(-x + a * Math.log(x) - gammaln(a)) * h
}

/**
 * Función gamma incompleta regularizada inferior P(a, x) = γ(a,x)/Γ(a).
 * Válida para a > 0, x ≥ 0.
 */
export function gammainc(a: number, x: number): number {
  if (x <= 0) return 0
  if (x < a + 1) return gammaincSeries(a, x)
  return 1 - gammaincCF(a, x)
}

// ── Integración numérica ─────────────────────────────────────

/**
 * Integración adaptativa de Simpson compuesta.
 * Útil como fallback para expectativas parciales sin forma cerrada.
 * @param f   Función a integrar
 * @param a   Límite inferior
 * @param b   Límite superior
 * @param n   Número de subintervalos (debe ser par, default 1000)
 */
export function integrarSimpson(
  f: (x: number) => number,
  a: number,
  b: number,
  n = 1000
): number {
  if (n % 2 !== 0) n += 1
  const h = (b - a) / n
  let sum = f(a) + f(b)
  for (let i = 1; i < n; i++) {
    sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h)
  }
  return (h / 3) * sum
}

// ── Inversión numérica de cuantiles ──────────────────────────

/**
 * Calcula el cuantil de cualquier distribución por bisección.
 * Usar cuando no exista forma cerrada para la inversa de la CDF.
 * @param cdf    Función de distribución acumulada
 * @param p      Probabilidad objetivo ∈ (0, 1)
 * @param lo     Límite inferior de búsqueda
 * @param hi     Límite superior de búsqueda
 * @param tol    Tolerancia (default 1e-10)
 */
export function cuantilPorBiseccion(
  cdf: (x: number) => number,
  p: number,
  lo: number,
  hi: number,
  tol = 1e-10
): number {
  let a = lo
  let b = hi
  // Detect whether the function is increasing or decreasing so callers don't
  // have to pre-arrange the objective. For a decreasing function f(lo)>f(hi),
  // the bracket that contains p is on the opposite side.
  const increasing = cdf(lo) <= cdf(hi)
  for (let i = 0; i < 100; i++) {
    const mid = (a + b) / 2
    if ((cdf(mid) < p) === increasing) {
      a = mid
    } else {
      b = mid
    }
    if (b - a < tol) break
  }
  return (a + b) / 2
}
