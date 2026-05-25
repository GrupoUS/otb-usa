# Run: 10× performance — `2026-03-26-10x-perf`

**Constraint:** sem novas dependências; MPA sem `ClientRouter`.  
**Validation:** `bun run lint && bunx astro check && bun run build`  
**Decision:** keep (todas)

| Loop | Hipótese | Arquivos |
|------|----------|----------|
| 1 | Remover instrumentação de build (`astro.config`) reduz trabalho e ruído em cada `astro build` | `astro.config.mjs` |
| 2 | `productsNav` sem fetch lateral em cada request de layout SSR | `src/lib/productsNav.ts` |
| 3 | `TextGenerateEffect` sem segundo `useEffect` de rede | `src/components/ui/text-generate-effect.tsx` |
| 4 | `LampBackdrop` sem `useEffect` só para telemetria | `src/components/ui/lamp.tsx` |
| 5 | `client:idle` no Hero adia hidratação React até idle → menos TBT na carga inicial | `src/components/home/Hero.astro` |
| 6 | Preconnect acelera descoberta de fontes Google usadas pelo Astro Fonts API | `src/layouts/Layout.astro` |
| 7 | Remover listener `astro:after-swap` no Layout (nunca dispara sem View Transitions) | `src/layouts/Layout.astro` |
| 8 | Idem no Header | `src/components/layout/Header.astro` |
| 9 | `fetchpriority="high"` no logo para competir por LCP com texto/hero | `src/components/shared/Logo.astro` |
| 10 | NeonStory: primeira imagem grande da landing mentoria com prioridade de rede; avatares com `low` | `NeonStory.astro`, `AboutPreview.astro`, `TeamGrid.astro`, `Founders.astro` |
