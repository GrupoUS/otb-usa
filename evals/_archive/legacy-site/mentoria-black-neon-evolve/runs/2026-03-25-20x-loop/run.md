# Run: 2026-03-25 — mentoria-black-neon 20× micro-loop (batch único)

Pedido do usuário: iterar “pelo menos 20 vezes” no sentido comercial. Em um único turno, consolidamos **20 decisões** explícitas (hipótese → patch → **keep**) aplicadas no mesmo diff, com validação única nos quality gates.

**Validação:** `bun run lint && bunx astro check && bun run build` — sucesso (2026-03-25).

| # | Hipótese | Arquivo / superfície | Decisão |
|---|----------|----------------------|---------|
| 1 | Title genérico dilui intenção de busca “mentoria clínica estética” | `mentoria-black-neon.astro` | keep |
| 2 | Meta description deve citar 6 meses + WhatsApp + vagas | `mentoria-black-neon.json` `description` | keep |
| 3 | Tagline do card/grid deve espelhar oferta e estágio (dono escalando) | `tagline` | keep |
| 4 | H1 muito longo e última palavra “você” fraca para o ouro do `LandingHero` | `hero.headline` | keep |
| 5 | Subheadline deve contrastar “6 meses ativos” vs curso gravado | `hero.subheadline` | keep |
| 6 | CTA deve nomear ação + canal sem soar vago | `cta.label` | keep |
| 7 | `whatsappMessage` deve qualificar (dono, vagas, investimento, ciclo) | `cta.whatsappMessage` | keep |
| 8 | Bloco story: headline com keyword “olhar de dono” | `story.headline` | keep |
| 9 | Parágrafos da story mais enxutos e paralelos técnica/negócio | `story.paragraphs` | keep |
| 10 | Highlight deve citar “Mentoria Black NEON” e pilares | `story.highlight` | keep |
| 11 | FAQ: objeção jornada TRINTAE3 vs Black NEON | `faqs[]` | keep |
| 12 | FAQ: objeção formato gravado vs mentoria viva | `faqs[]` | keep |
| 13 | Open Graph deve usar arte do produto | `mentoria-black-neon.astro` `ogImage` | keep |
| 14 | `NeonStory`: remover hex hardcoded (regra AGENTS) | `NeonStory.astro` | keep |
| 15 | `NeonStory` imagem abaixo da dobra não deve roubar LCP | `loading`/`fetchpriority` | keep |
| 16 | Alt da foto da Sacha com contexto produto (a11y + SEO leve) | `NeonStory.astro` `alt` | keep |
| 17 | Alinhamento título/H1: keywords “escala”, “clínica”, “NEON” | conjunto page + JSON | keep |
| 18 | Prova social já existente mantida; narrativa hero reforça premium | — | keep (sem mudança) |
| 19 | Mobile CTA: label curto o suficiente para barra fixa | `cta.label` comprimento | keep |
| 20 | Breadcrumbs + canonical já via `Layout`; sem SPA | — | keep (verificado) |

## `<answer>` (schema auto-research-gpus)

```xml
<answer>
  <reasoning>
    Baseline: copy forte porém title/meta/H1 pouco alinhados a SERP; H1 terminava em “você” (destaque dourado fraco); CTA genérico; FAQ sem objeções de funil; NeonStory com hex solto e imagem competindo com LCP em hero texto-first.
  </reasoning>
  <baseline>
    headline matches buyer intent: parcial → melhorado
    CTA names action and outcome: não → sim
    title/meta/H1 alignment: parcial → melhorado
    proof above fold: depoimentos abaixo; hero com promessa clara
    Commands: lint + astro check + build OK
  </baseline>
  <experiment>
    <tag>2026-03-25-mentoria-black-neon-20x</tag>
    <branch>autoresearch/2026-03-25-mentoria-black-neon-20x</branch>
    <hypothesis>Alinhar SERP, narrativa de dono de clínica, CTA qualificador e LCP ao priorizar hero texto-first na landing NEON.</hypothesis>
    <files>src/content/products/mentoria-black-neon.json, src/pages/mentoria-black-neon.astro, src/components/landing/NeonStory.astro</files>
    <patch_summary>JSON copy/SEO/FAQ/CTA; title+ogImage na page; NeonStory token bg + lazy image + alt.</patch_summary>
  </experiment>
  <validation>
    <commands>bun run lint; bunx astro check; bun run build</commands>
    <expected>Comercial ↑; LCP candidate menos disputado por imagem story</expected>
    <decision>keep</decision>
  </validation>
  <log_entry>
    Ver AGENTS.md Learnings log — entrada 2026-03-25 Mentoria Black NEON.
  </log_entry>
  <next_suggested>Medir CTR e queries em GSC após 2–4 semanas; opcional JSON-LD dedicado se houver pedido de rich results.</next_suggested>
</answer>
```
