# CLAUDE.md

NEVER RUN THE DEV SERVER IT IS ALREADY RUNNING

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev          # start dev server NEVER USE THIS COMMAND, THE DEV SERVER IS ALREADY RUNNING
bun run typecheck    # tsc --noEmit (no emit, fastest type check)
bun run build        # tsc -b && vite build
bun run lint         # eslint
bun run format       # prettier --write
```

No test suite exists. Use `bun run typecheck` to verify correctness after changes.

## Architecture

This is a React 19 + TypeScript app for computing and visualising continuous probability distributions. Stack: Vite 8, TanStack Router (file-based, auto code-splitting), Tailwind v4, shadcn/Base UI components, react-katex for LaTeX, Recharts for charts. `@` aliases to `src/`.

### Data layer — `src/lib/distribuciones/`

Each distribution is a single `DistribucionSpec<P>` object (typed in `tipos.ts`) that co-locates everything: PDF/CDF/quantile functions, all 9 calculated quantities (each as a `Calculo<TInput>` with `titulo`, `descripcionTeorica`, `formulaGeneral`, `calcular`, and `formulaConValores`), and optional `derivacionesDeParametros` for alternative input modes.

Key files:
- `tipos.ts` — all shared TypeScript contracts
- `matematica.ts` — pure math helpers (erf, Phi, gammaln, integrarSimpson, cuantilPorBiseccion)
- `formato.ts` — `formatoResumen` (4 dec), `formatoDetalle`, `numeroLatex` (for LaTeX string interpolation)
- `normal.ts` — the most complete example; use as template for new distributions
- `index.ts` — re-exports everything

The 9 standard `Calculo` fields on every spec:
`probabilidadAcumuladaIzquierda`, `probabilidadAcumuladaDerecha`, `valorDadaProbabilidadIzquierda`, `valorDadaProbabilidadDerecha`, `expectativaParcialIzquierda`, `expectativaParcialDerecha`, `promedioTruncadoIzquierdo`, `promedioTruncadoDerecho`, `promedioTruncadoDosColas`

Optional: `esperanza`, `desvio` (`CalculoSinEntrada<P>`), `probabilidadIntervalo`.

#### Parameter derivation

`derivacionesDeParametros?: DerivacionDeParametros<P>[]` — each entry adds a toggle button to the parameter panel with its own inputs and derivation logic:

```ts
{
  etiquetaBoton: "Media y desvío",
  inputs: [
    { etiqueta: "Media", placeholder: "μ" },
    { etiqueta: "Desv. estándar", placeholder: "σ", min: 0 },
  ],
  derivar([media, desvio]) {
    // returns { params: P; pasos: FormulaRender[] } | null
  },
}
```

### UI layer — `src/components/distribuciones/`

Shared components used by every distribution page:
- `ParametrosPanel` — renders parameter inputs + derivation toggles; calls `onParamsChange(params | null)`
- `ResultadoFila` — one result row: info icon | label | formatted value + detail
- `FormulaInfo` — icon button that opens a Dialog with `BlockMath` formula (general + with substituted values)
- `DerivacionParametros` — shows derivation steps as `InlineMath` pairs (general → con valores)

Each distribution has its own `*-page.tsx` (the actual UI) and optionally a `*-chart.tsx` (Recharts visualisation).

### Routing — `src/routes/`

File-based TanStack Router. Each route file exports `Route = createFileRoute("/slug")({...})`. Routes that have a completed `*-page.tsx` import and render it directly; incomplete distributions still render the generic `DistributionPage` placeholder from `src/components/distribution-page.tsx`.

**Completed distributions** (have their own `*-page.tsx`): normal, normal-estandar, weibull, log-normal, pareto, uniforme.

**Still using placeholder**: exponencial, gamma, gumbel-maximo, gumbel-minimo.

## Adding a new distribution page

1. Fill any `NaN` TODOs in `src/lib/distribuciones/<slug>.ts`
2. Create `src/components/distribuciones/<slug>-page.tsx` following `normal-page.tsx` or `weibull-page.tsx` as template
3. Update `src/routes/<slug>.tsx` to import and render the new page instead of `DistributionPage`
4. Unless the user EXPLICITLY requests it, never add additional components not found in the example pages, even if the prompt includes the formulas for them.
