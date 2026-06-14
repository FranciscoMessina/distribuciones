// ============================================================
// Registro centralizado de todas las distribuciones
// ============================================================

export type { DistribucionSpec, Calculo, CalculoSinEntrada, ParametroDef, FormulaRender } from "./tipos"
export type { EntradaX, EntradaP, EntradaDosColas } from "./tipos"

export { DistribucionNormal } from "./normal"
export type { ParamsNormal } from "./normal"

export { DistribucionNormalEstandar } from "./normal-estandar"
export type { ParamsNormalEstandar } from "./normal-estandar"

export { DistribucionExponencial } from "./exponencial"
export type { ParamsExponencial } from "./exponencial"

export { DistribucionWeibull } from "./weibull"
export type { ParamsWeibull } from "./weibull"

export { DistribucionGumbelMaximo } from "./gumbel-maximo"
export type { ParamsGumbelMaximo } from "./gumbel-maximo"

export { DistribucionGumbelMinimo } from "./gumbel-minimo"
export type { ParamsGumbelMinimo } from "./gumbel-minimo"

export { DistribucionPareto } from "./pareto"
export type { ParamsPareto } from "./pareto"

export { DistribucionUniforme } from "./uniforme"
export type { ParamsUniforme } from "./uniforme"

export { DistribucionLogNormal } from "./log-normal"
export type { ParamsLogNormal } from "./log-normal"

export { DistribucionGamma } from "./gamma"
export type { ParamsGamma } from "./gamma"
