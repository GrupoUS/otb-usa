# Run `2026-03-26-evolve-home`

**Tag:** `2026-03-26-evolve-home`  
**Área:** home narrativa + SEO + jornada  
**Decision:** keep

## `<answer>` (schema auto-research-gpus)

### reasoning

Pedido explícito de `/evolve` em modo site (copy/SEO/conversão). Baseline: home com título genérico “Ecossistema”, hero com promessa ampla e CTA pouco orientado à trilha; timeline com copy sem acentuação e subtítulo voltado a implementação. Hipótese única: **alinhar SERP + Hero + jornada** à mesma narrativa (formação → negócio → prova social implícita) e reduzir fricção cognitiva na jornada.

### baseline

- Title focado em “Ecossistema” sem âncora clara de intenção (formação/negócios).
- Description home ok mas menos orientada a ação e à trilha.
- Hero: headline genérica (“referências” sem âmbito); subtítulo “ecossistema mais completo” é claim difícil de verificar.
- CTA primário “Conheça nossos produtos” genérico.
- Journey: resumos sem acento; subtítulo da seção menciona “manual” e “URLs” (interno).

### experiment

- **Arquivos:** `src/pages/index.astro`, `src/components/home/Hero.astro`, `src/components/home/JourneyTimeline.astro`, `src/layouts/Layout.astro`, `.claude/commands/evolve.md` (fallback §1.0 para linguagem natural).
- **Hipótese:** visitante entende mais rápido *o que* é o Grupo US, *para quem* e *qual próximo passo*; SERP reflete intenção comercial; timeline transmite profissionalismo (pt-BR).

### validation

- `bun run lint`
- `bunx astro check`
- `bun run build`

### decision

keep — mudanças são de copy/SEO/UX verbal, sem novo JS, alinhadas a AGENTS (sem hardcode de dados de produto na jornada; slugs inalterados).

### log_entry (AGENTS.md)

Ver entrada **[2026-03-26] Home: alinhar SERP, Hero e jornada à trilha comercial** em `AGENTS.md` → `## Learnings log (evolve)`.
