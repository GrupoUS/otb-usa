# Palette Variants — variar por produto sem sair do padrão

> **Propósito.** A paleta **Navy/Gold** é a **referência canônica** (Portal Grupo US / site institucional). Cada novo produto/landing pode usar uma **variante adjacente** — um pouco mais escura, mais clara, ou com metálico/azul vizinho — para **não ficar tudo igual**, **mantendo o DNA da marca**. Use este arquivo como cardápio: escolha uma variante, sobrescreva os poucos tokens-base, e o resto do sistema (sombras, glow, glass, tilt) se ajusta sozinho.
>
> **O site institucional `gpus` permanece Navy/Gold canônico.** Variantes são para **outros** produtos/landings.

---

## DNA da marca — o que NUNCA muda

Toda variante mantém:

1. **Base de superfície = azul profundo** (navy/indigo/teal/ônix — sempre escuro e dessaturado-elegante; nunca um azul "berrante").
2. **Accent = metálico quente** (dourado/champanhe/latão/bronze/cobre — nunca rosa/roxo/verde como destaque principal).
3. **Contraste alto + premium**: texto/accent claro sobre superfície escura (ou navy escuro sobre claro, na variante light).
4. **Profundidade em camadas** (sombra ambient+key, glow em tiers, glass com inner highlight) — herdada via tokens.
5. **`prefers-reduced-motion` como piso duro** + tokens-only (sem hex inline) — invariantes do projeto.

> Se mudar a base para algo que **não** seja azul-escuro + metálico-quente, já não é variação — é outra marca. Não faça.

---

## Eixos de variação

Combine livremente, um ou dois eixos por produto (não mexa em tudo de uma vez):

| Eixo | De → Para | Efeito |
|---|---|---|
| **Lightness da base** | mais escuro (meia-noite) ↔ mais claro (porcelana) | peso / sobriedade vs leveza / acessível |
| **Hue do azul** | teal (~198) → navy (~211) → índigo (~230) | clínico/tech → institucional → premium/luxo |
| **Metálico do accent** | bronze/cobre (~28) → dourado (~39) → champanhe (~44) | sóbrio/masculino → clássico → elegante/leve |
| **Saturação da base** | dessaturada (ônix ~26% S) ↔ saturada (royal ~50% S) | discreto/neutro ↔ rico/vibrante |

---

## Variantes prontas

Cada bloco lista os **tokens-base** a sobrescrever (formato HSL shadcn, sem `hsl()`). Hex é **aprox.** (rótulo). Onde não indicado, herda do canon.

### 0. Navy/Gold — CANON (referência)
Base institucional. Não alterar no site `gpus`.

| Token | Dark | aprox. |
|---|---|---|
| `--background` | `211 49% 10%` | `#0d1b2a` |
| `--card` | `212 48% 13%` | — |
| `--foreground` | `39 44% 65%` | `#c9a66b` |
| `--primary` | `39 44% 65%` | dourado |
| `--ring` | `39 29% 54%` | — |

---

### 1. Meia-Noite — **mais escuro** (high-ticket / black)
Navy quase-preto, dourado um tom mais profundo. Peso e exclusividade. Uso: mentoria premium, produto "black".

| Token | Dark | aprox. |
|---|---|---|
| `--background` | `214 56% 6%` | `#07101a` |
| `--card` | `214 50% 9%` | `#0c1825` |
| `--foreground` | `41 46% 66%` | `#cbaa6e` |
| `--primary` | `41 50% 58%` | `#c49a4f` |
| `--primary-foreground` | `214 56% 5%` | quase-preto |
| `--accent` | `214 30% 16%` | — |
| `--ring` | `41 35% 50%` | — |

---

### 2. Porcelana — **mais claro** (light-first / educacional)
Off-white quente + navy escuro de texto + dourado mais escuro p/ contraste em claro. Leve, acessível, conteúdo/blog. (Única variante **light-first**.)

| Token | Light | aprox. |
|---|---|---|
| `--background` | `40 33% 97%` | `#faf7f0` |
| `--card` | `0 0% 100%` | `#ffffff` |
| `--foreground` | `216 45% 14%` | `#142233` |
| `--primary` | `38 58% 42%` | `#ab7f2c` |
| `--primary-foreground` | `0 0% 100%` | branco |
| `--muted` | `40 20% 92%` | — |
| `--border` | `40 20% 86%` | — |
| `--ring` | `38 58% 42%` | — |

---

### 3. Índigo Real — **azul → índigo**, accent champanhe (premium diferenciado)
Mesma família, hue do azul puxado p/ índigo + champanhe. Sofisticado sem sair de azul+dourado.

| Token | Dark | aprox. |
|---|---|---|
| `--background` | `230 44% 11%` | `#10142a` |
| `--card` | `231 40% 14%` | `#171c33` |
| `--foreground` | `43 52% 70%` | `#d4b46a` |
| `--primary` | `43 56% 66%` | `#d0ad5f` |
| `--primary-foreground` | `230 44% 9%` | índigo escuro |
| `--accent` | `231 25% 20%` | — |
| `--ring` | `43 38% 56%` | — |

---

### 4. Petróleo — **azul → teal**, accent latão (clínico/tech)
Teal-navy profundo + latão. Ar mais "clínico premium" / tecnológico. Bom p/ produto de saúde/diagnóstico.

| Token | Dark | aprox. |
|---|---|---|
| `--background` | `198 52% 8%` | `#061620` |
| `--card` | `199 46% 11%` | `#0d212c` |
| `--foreground` | `42 38% 64%` | `#bda06a` |
| `--primary` | `41 44% 60%` | `#c2a05c` |
| `--primary-foreground` | `198 52% 6%` | teal escuro |
| `--accent` | `198 30% 16%` | — |
| `--ring` | `41 32% 52%` | — |

---

### 5. Bronze & Ônix — **base dessaturada + accent cobre** (sóbrio/masculino)
Navy quase-neutro (ônix) + cobre/bronze. Sério, sofisticado, discreto.

| Token | Dark | aprox. |
|---|---|---|
| `--background` | `216 26% 8%` | `#0f141a` |
| `--card` | `216 22% 11%` | `#161c24` |
| `--foreground` | `30 44% 60%` | `#c2895a` |
| `--primary` | `28 50% 54%` | `#c47f49` |
| `--primary-foreground` | `216 26% 6%` | ônix |
| `--accent` | `24 20% 18%` | — |
| `--ring` | `28 38% 48%` | — |

---

### 6. Champanhe — **base navy canon + accent dourado claro** (elegante/estética)
Mesmo azul do canon, dourado mais claro/champanhe. Leve, elegante, "feminino premium". Mínima mudança: só o accent.

| Token | Dark | aprox. |
|---|---|---|
| `--background` | `211 49% 10%` | `#0d1b2a` (canon) |
| `--card` | `212 48% 13%` | — |
| `--foreground` | `44 46% 74%` | `#ddc680` |
| `--primary` | `44 50% 70%` | `#d9c074` |
| `--primary-foreground` | `211 49% 8%` | navy |
| `--ring` | `44 34% 60%` | — |

---

## Como aplicar por produto

A profundidade segue a base automaticamente: os tokens de **glow** (`--glow-gold-*`) usam `color-mix` sobre `--primary`, então trocar o accent **retune o glow sozinho**. Você só sobrescreve a base.

### Projeto que usa o tema portátil (shadcn HSL — `theme-tokens.css`)
No CSS do produto, depois de importar o tema, sobrescreva só os tokens da variante:
```css
@import "tailwindcss";
@import "./theme-tokens.css";

/* produto <slug> — variante "Índigo Real" */
.dark {
  --background: 230 44% 11%;
  --card: 231 40% 14%;
  --foreground: 43 52% 70%;
  --primary: 43 56% 66%;
  --primary-foreground: 230 44% 9%;
  --accent: 231 25% 20%;
  --ring: 43 38% 56%;
}
```
Glow herda de `--primary`. Se quiser tonalizar também a **elevação** pela nova base, ajuste a base neutra de `--shadow-elevation-*` em `.dark` (ver `theme-tokens.css`).

### Site institucional / landing Astro (hex `@theme` — `global.css`)
Esse build usa `--color-navy` / `--color-gold` (hex) no `@theme`, e os tokens de profundidade fazem `color-mix` sobre eles. Para uma variante, troque os dois hex (e os derivados light/dark se houver) pelos equivalentes da variante — **sombras, glow, glass e tilt se reajustam sozinhos** porque referenciam `var(--color-navy)` / `var(--color-gold)`:
```css
@theme {
  /* variante "Meia-Noite" */
  --color-navy: #07101a;       /* era #1a1a2e */
  --color-navy-light: #0c1825;
  --color-gold: #c49a4f;       /* era #d4af37 */
  --color-gold-light: #d8b873;
}
```

---

## Regras de harmonia (checklist antes de fechar uma variante)

- [ ] Base continua **azul-escuro** (ou off-white na Porcelana) e accent continua **metálico quente** → DNA preservado.
- [ ] **Contraste AA**: texto/accent sobre a base ≥ 4.5:1 (corpo) / ≥ 3:1 (grande). Valide os pares novos (ex.: champanhe sobre índigo).
- [ ] **Mexa em 1–2 eixos**, não em todos — variação sutil lê como "mesma marca, outro produto"; variação total lê como "outra marca".
- [ ] **Um accent metálico só** por produto (não misture cobre + champanhe na mesma tela).
- [ ] **`--primary-foreground`** sempre escuro o suficiente para texto legível **sobre** o botão metálico.
- [ ] Deixe a **profundidade herdar** (não hardcode sombra/glow novos — Cardinal 7). Só ajuste a base neutra de elevação se quiser tom.
- [ ] **Verde/vermelho** seguem semânticos (sucesso/erro) — não vire-os accent de marca.

---

## Mapa sugerido produto → variante

Sugestão (não regra) para diversificar a casa:

| Tipo de produto | Variante sugerida |
|---|---|
| Institucional / Portal | **Canon** Navy/Gold |
| Mentoria / high-ticket / "black" | **Meia-Noite** |
| Educacional / conteúdo / blog | **Porcelana** (light) |
| Premium / luxo diferenciado | **Índigo Real** |
| Saúde / diagnóstico / tech | **Petróleo** |
| Sóbrio / masculino / consultoria | **Bronze & Ônix** |
| Estética / elegante / feminino | **Champanhe** |

> O objetivo é que duas landings do Grupo US lado a lado se reconheçam como **mesma família**, mas nenhuma pareça **carbono** da outra.
