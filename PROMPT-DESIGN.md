# Prompt para o Claude Code — design da landing OTB USA

Cole isto numa sessão nova do Claude Code, aberto em `~/Projects/otb-usa` (branch `main`). Não invente prova social, vagas, urgência, endosso de Boston, nem redesenhe a marca. Respeite `PRODUCT.md` (honesty + conversão WhatsApp) e `DESIGN.md` (tokens `ink`/`gold`/`crimson`, runtime de motion). **Não commit/push.**

---

Você é design engineer em pt-BR. Repo: `~/Projects/otb-usa`. Superfície: landing `https://otb.gpus.com.br/` (`src/pages/index.astro` + `src/components/landing/*` + `src/styles/global.css` + `src/scripts/motion.ts`). Modo: **Persuade**.

Identidade: **REFINAR**. Manter o mundo visual aprovado (preto `ink`, gold, crimson EUA, Sora display + Inter body, fotos reais de turma). Não voltar para navy GPUS. Não trocar para Playfair/cream/terracotta, dark+verde ácido, glass+gradiente roxo. Não é redesign de marca.

Job da página: profissional de Saúde Estética com carreira feita inicia conversa no WhatsApp com a SDR Laura. Uma oferta, uma ação primária. Sem checkout até `checkoutUrl` existir.

## Diagnóstico já feito (use; não rediscuta)

Evidência live 2026-09-01: viewport 1440×900 e 390×844; `scrollHeight` ~18800 px desktop / ~24200 px mobile; 16 seções; detector Impeccable: em-dash em `Aplicacao.astro`, `img src=""` no lightbox (JS). Motion no markup: `data-reveal` ×88, `data-parallax` ×14, `data-tilt` ×11, `data-shine` ×12, `data-marquee` ×9, `data-enter` ×11.

**5 segundos:** o visitante lê “primeiro MBA do mundo em Business Aesthetic Health” e um CTA WhatsApp. Não lê o que *compra* (320h + 3 dias Boston, Lote 1 US$ 3.500) sem descer — o preço só vive na sticky. A foto do hero está tão escurecida (scrim 78–97% + wash crimson) que some; no mobile vira mancha.

**Especificidade:** o mundo (Boston, Fresh Specimens, OTB, crimson de bandeira) é próprio. A *montagem* é landing de coorte high-ticket: hero full-bleed + chips ouro + countdown + sticky bar + numeração 01–10 em toda seção + reveal em tudo.

**Gold está em tudo:** logo, highlight do h1, chips, CTA, ícones da fact rail, countdown, kickers. Sem assinatura única.

**Sticky cobre conteúdo** (legendas da galeria, títulos de seção). O CSS reserva `padding-bottom`; na live 390 e 1440 ainda clipa.

**Countdown 229 dias** até abr/2027: o dispositivo de urgência não casa com o ciclo longo (`PRODUCT.md`). Manter a data; não tratar 229d como “faltam poucas horas”.

**CTA duplicado:** hero “Falar com Laura no WhatsApp” (quebra em 2 linhas no mobile), header + sticky “Falar com Laura”, float WA. Um primário.

## P0 visual

1. **Hero plate legível.** Em `Hero.astro` o scrim está em `style=` com ramp 97/90/78% + crimson 24%. Baixe a opacidade o bastante para o sujeito (touca OTB, máscara, mesa) ser reconhecível **e** o lede continue ≥4.5:1 / headings ≥3:1. Recorte `object-[center_32%]` se o rosto brigar com o h1. Sem foto stock nova.
2. **Uma assinatura de ouro.** Gold no h1 highlight **ou** no CTA primário — não nos dois com o mesmo peso. Chips: borda ink/muted, sem bolinha gold em cada um. Ícones da fact rail: `text-secondary`, não gold.
3. **Dobra menos densa.** Desktop: 4 chips numa linha (o 4º “Networking internacional” não pode órfão). Mobile: CTA numa linha (ícone+texto; seta pode sair). Countdown no mobile: 3 colunas claras (dias/horas/min), não string `229 : 12 : 04`. Fact rail do hero pode ficar; sticky não deve repetir os 4 fatos iguais.
4. **Vazios pretos entre seções.** Há faixas mortas (Virada → Público, galeria → módulos). Compactar `py-section` / min-heights que inflaram o 18k px. Não apagar seções de produto; enxugar espaço vazio.

## P0 UX

1. **Sticky não cobre.** Medir altura real da barra (lote + countdown + CTA) em 390 e 1440 e igualar o `padding-bottom` do `body` em `global.css`. Verificar galeria Boston/Turmas: legendas não podem ficar atrás da barra.
2. **Um CTA primário.** Sticky: lote + data + um botão. Header: o mesmo label do hero, ou só nav. Float WA some quando a sticky está visível (já é a intenção — confirmar que `is-retracted` dispara).
3. **Countdown honesto.** Data de Boston pode aparecer. Tirar o pulso crimson “live” e o tick de 1s da dobra se o número for >90 dias — ou reduzir a segundos só depois que faltar <7 dias. Sem “últimas vagas”.
4. **Foco no form.** `#inscricao` continua no fim da oferta (ok). Não adicione segundo produto. Modal `LeadFormDialog` continua respondendo os CTAs.

## P0 motion

Runtime único: `src/scripts/motion.ts`. Não abra listener de scroll novo. Não instale Framer/GSAP.

- **Animar (um momento):** cascata `data-enter` do hero (já existe). Curvas/durações do `DESIGN.md § 9` / tokens do projeto.
- **Nunca animar:** header, nav, sticky, fact rail, countdown (chrome). Ações de teclado.
- **Cortar da dobra:** `data-hero-fade` (já foi LCP 6,7s→2,0s uma vez — não reintroduzir fade de opacity no lede). `data-shine` no CTA do first paint. Parallax dos dois orbs gold/crimson no hero (os washes estáticos podem ficar).
- **Reveals:** 88 é default. Limitar `data-reveal` a headings de seção + 1 bloco por seção. Cards/listas entram estáticos.
- **Marquee de certificações:** manter só com `data-marquee-toggle` (WCAG 2.2.2). Sem o botão, não anima.
- **`prefers-reduced-motion: reduce`:** cross-fade ou none; countdown pode ficar estático. O runtime já desliga decorativo — não regredir.

## P1

- Numeração 01–10 em **toda** seção é template. Manter numeral só onde é sequência de verdade (3 dias da agenda, 10 módulos, 4 travas da Virada). Kickers das outras seções: sem badge vermelho 06/07/10.
- Três colunas iguais (pilares / Boston / módulos): quebrar 50/50 e 1/1/1 — assimetria 7/5 ou um card âncora.
- Galeria mobile 2 colunas com alturas desiguais + sticky por cima: 1 coluna no `<640px` ou mosaic com `padding-bottom` correto.
- Contraste de `text-secondary` sobre foto: se falhar 4.5:1, usar `text-primary` no lede do hero.
- Detector: lightbox `src=""` é preenchido por JS — não “corrigir” com placeholder visível. Em-dashes em `Aplicacao.astro`: reduzir saturação (vírgula/ponto).

## Proibido

- Paleta cream+serif+terracota, dark+verde ácido, glass+gradiente roxo, emoji no lugar de ícone.
- Inventar depoimento, métrica, vaga, endosso Harvard/MIT/Boston University (issue #1).
- Hardcode de copy em `.astro` — copy em `src/content/products/otb.json`.
- Hex fora de `@theme` em `global.css`.
- `wa.me` inline; npm/yarn; React island nova; commit/push.
- Biblioteca de motion para fade.

## Arquivos permitidos

- `src/components/landing/Hero.astro`
- `src/components/landing/StickyCta.astro`
- `src/components/landing/WhatsAppFloatingButton.astro`
- `src/components/landing/Header.astro`
- `src/components/landing/SectionHeader.astro`
- `src/components/landing/Virada.astro`, `WhyOTB.astro`, `TargetAudience.astro`, `Modulos.astro`, `Boston.astro`, `Turmas.astro`, `Certificacoes.astro`
- `src/styles/global.css`
- `src/scripts/motion.ts` (só se o gate de reduced-motion/reveal exigir)
- `src/content/products/otb.json` **somente** se um badge/cta precisar encolher para caber numa linha (não reescrever posicionamento)

Não mexer: `api/leads.ts`, worker, GTM, `whatsapp.ts` (número/prefixo), legal/disclaimer, `noindex` de `/redirecionando`.

## Gates (citar output)

```bash
bun run lint
bunx astro check
bun run build
```

Se a geometria da sticky/hero mudar:

```bash
bun run smoke
```

## Entrega

1. Diff só nos arquivos acima.
2. Antes → depois dos 3 maiores achados (hero scrim, gold hierarchy, sticky clip).
3. O que **não** animou, e por quê.
4. Output dos gates.

Comece lendo `DESIGN.md § 2` (tokens ink), `§ 9` (motion), `PRODUCT.md` (CTA único, honesty) e `Hero.astro`. Depois implemente. Não peça permissão para cada valor de opacidade.
