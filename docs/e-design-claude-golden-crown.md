# Plan — OTB Estados Unidos / Harvard (Landing Astro)

> Plano de implementação read-only. Não escrever código até aprovação explícita do usuário.
> Repositório alvo: `F:\Projetos\otb-usa` (`gp-us-harmonic-pascal`, Astro 6 estático scaffold vazio).
> Repositório fonte de conteúdo: `F:\Projetos\ota-dubai` (React/Vite, presentation deck OTB Dubai, leitura apenas).
> Complexidade: **L5 — Medium**. 10 sections, 4 layers (content collection + lib SSOT + layout + presentation), 5 cardinais aplicáveis, integração cross-cutting com SEO + a11y + perf gates.

---

## 1. Executive Summary

Construir landing OTB Estados Unidos em `src/pages/otb.astro` no scaffold Astro alvo, lendo toda a copy de `src/content/products/otb.json` (cardinal #5), com Layout institucional Navy/Gold (`src/layouts/Layout.astro`) e helper WhatsApp SSOT (`src/lib/whatsapp.ts`). Conteúdo adaptado de `ota-dubai` (9 slides React) para 10 seções Astro estáticas em pt-BR, removendo todo posicionamento Dubai/AMWC e substituindo por narrativa Boston/ecossistema Harvard + demonstração anatômica avançada + networking premium. Disclaimer legal obrigatório (Harvard é marca registrada; sem vínculo oficial implícito). 5 speakers PT-BR + logos OTB + estrutura dos 10 módulos online + preço US$ 4.000 reaproveitados; identidade visual e assets Dubai descartados; novas imagens Boston/Harvard/laboratório premium ficam `[REQUIRES APPROVAL]` (licenciamento).

---

## 2. Codebase Findings (confiança + file:line)

### Repositório alvo (`F:\Projetos\otb-usa`) — conf 5
- **Stack** (`package.json`): Astro 6.0.8 estático MPA, Bun, Tailwind v4.2.2, React 19 islands, Lucide React, Playfair Display + Inter via `fontProviders.google()` ([astro.config.mjs:11-26](astro.config.mjs:11)), Biome + oxlint, Lefthook. Sem testes.
- **Scaffold atual**: `src/pages/index.astro` é HTML mínimo ([src/pages/index.astro:1-15](src/pages/index.astro:1)). `src/content.config.ts` exporta `collections = {}` ([src/content.config.ts:1-6](src/content.config.ts:1)). `src/styles/global.css` já contém Navy/Gold @theme + 12 @utilities (gold-glow, glass-card, glass-card-bright, landing-mesh-bg, text-shimmer, text-gradient-gold, card-hover-lift, gold-pulse-glow, float-gentle, animate-spotlight, animate-aurora, card-glow-hover) + 7 keyframes + `[data-reveal]` IntersectionObserver pattern + skip link + reduced-motion ([src/styles/global.css:1-482](src/styles/global.css:1)).
- **Sem Layout.astro**, **sem componentes**, **sem `src/lib/whatsapp.ts`**. Tudo a criar.
- **Diretrizes** (`.claude/CLAUDE.md` + `AGENTS.md`): 8 cardinais imutáveis, design philosophy "Intentional Minimalism", overlay-first config (`.claude/config.json::overlay = .claude/overlay/gp-us-harmonic-pascal`).
- **Brand SSOT** (`grupo-us` skill): OTB MBA = topo da jornada do aluno = "international, **Boston/Harvard, Fresh Specimens**". Harvard é posicionamento canônico OTB, não invenção. CEO: Dra. Sacha Gualberto. Sede: Goiânia.
- **WhatsApp SSOT** (`grupo-us/references/whatsapp-ssot.md`): número E.164 `556294705081`, SDR Laura, mensagem padrão obrigatória começa `"Olá, Laura!"`.

### Repositório fonte (`F:\Projetos\ota-dubai`) — conf 5
- **Stack divergente**: React 18 + Vite 5 + Tailwind v3 + shadcn/ui Radix + Framer Motion + React Router + TanStack Query + next-themes + Embla. Nada migra como código; **só conteúdo**.
- **9 slides existentes**: HeroSlide, WhyOTBSlide, TargetAudienceSlide, ExperienceSlide, TurmasSlide, ModulesSlide, DubaiExperienceSlide, SpeakersSlide, InvestmentSlide + SlideNavigation.
- **Copy verbatim core** (compilado pelo Explorer):
  - Hero: "O primeiro MBA do mundo em **Business Aesthetic Health com experiência em Dubai**", "3ª Turma • Vagas Limitadas", tags MEC + 320h + Imersão Dubai.
  - Why: "Reconhecimento Comprovado" (selo MEC + first MBA blend), "Uma Visão Além da Técnica" (gestão estratégica), "Práticas Demonstrativas" (demo presencial).
  - Audience: "Idealizamos o OTB para aqueles profissionais de Saúde Estética que rompem as barreiras do convencional." — 6 categorias profissionais.
  - Experience: 320h online + business/gestão/marketing/vendas + imersão presencial. Card AMWC = remover.
  - Turmas: "Já estamos na terceira turma. E é só o começo." — 2 fotos turma 1+2.
  - Módulos: 10 módulos (Mentalidade, Gestão Clínica, Contratação, Marketing, Expansão, Financeira, Sistemas+IA, Vendas, Jurídico, Associações).
  - Dubai Experience: 3 cards (Day Clinic 18/10, Imersão Taj 19/10, Desert Luxury 20/10) + bonus AMWC = **substituir inteiro**.
  - Speakers: 5 cards (Sacha Gualberto, Ana Carolina, Mariana Laranja, Dieick de Sá, Rosana Vecchi) com Instagram links.
  - Investment: US$ 4.000 à vista, parcelamento crédito/boleto, 5 benefícios check-marked.
- **Assets Dubai** (descartáveis): 14 imagens (4 skylines, 2 desert, 2 hotel/clinic, 1 amwc-event, 2 turma-grupo, 5 speakers). 2 logos OTB (otb-logo-gold.png, logo-otb.png) **reutilizáveis**.
- **Pattern reusable conceitual** (não código): asymmetric hero split, gold-glow card, reveal-on-scroll, gradient avatar border, animated dot badges, shimmer loop, smooth scroll dots. Todos já existem como `@utility` no `global.css` alvo.

---

## 3. Assumptions & Unknowns

- **[ASSUMED]** Edição EUA mantém estrutura de 10 módulos online idêntica à Dubai (`grupo-us` skill cita "MBA international" como evergreen).
- **[ASSUMED]** Preço US$ 4.000 mantido (confirmado pelo usuário no questionário).
- **[ASSUMED]** Roster de 5 speakers PT-BR mantido (confirmado pelo usuário, sujeito a verificação final de cada fotografia/bio antes do go-live).
- **[ASSUMED]** Logos OTB do `ota-dubai` (`otb-logo-gold.png`, `logo-otb.png`) são marca própria do Grupo US e reutilizáveis sem licenciamento externo.
- **[ASSUMED]** Locale fixo `pt-BR` (alinhado com `.claude/config.json::project.locale`).
- **[ASSUMED]** Landing vive em `/otb` (`src/pages/otb.astro`); raiz `/` mantém `index.astro` placeholder até home institucional ser definida em milestone futura.

### Unknowns flagados (`[UNVERIFIED]` — não bloquear plano; resolver antes do conteúdo final)

- **[UNVERIFIED]** Datas exatas da edição EUA (Dubai era 18-23/Out). Placeholder `"[DATAS A CONFIRMAR]"` no JSON.
- **[UNVERIFIED]** Cidade/venue exatos (Boston confirmado em direção; campus/lab específico pendente). Placeholder `"Boston, Estados Unidos — venue a confirmar"`.
- **[UNVERIFIED]** Local específico da demonstração anatômica avançada em cadáver fresco (Harvard Medical / instituição independente / lab privado). Copy professional sem afirmar venue até confirmação.
- **[UNVERIFIED]** Número da turma EUA (Dubai = "3ª Turma"). Placeholder `"[Nº TURMA]"`.
- **[UNVERIFIED]** Checkout URL e meios de pagamento finais (Dubai não tinha botão CTA visível na InvestmentSlide).
- **[UNVERIFIED]** Itinerário completo, inclusos/não inclusos da experiência presencial (transfer, hospedagem, alimentação, ingressos extras).
- **[UNVERIFIED]** Bio + foto + Instagram atualizados de cada um dos 5 speakers para edição EUA.
- **[UNVERIFIED]** Política Harvard Trademark — página `trademark.harvard.edu` retornou HTTP 403 na verificação. Plano adota postura defensiva (disclaimer + zero uso de logo/shield) que é segura mesmo sem o texto literal.
- **[UNVERIFIED]** OG image padrão do site (`public/og/default.png` ou similar) — projeto ainda não definiu identidade visual social.

---

## 4. External Findings (fonte + confiança)

| Claim | Fonte | Conf | Uso permitido na copy |
|---|---|---:|---|
| Harvard fundada em 28/Out/1636, Cambridge MA, primeira faculdade das colônias americanas | [harvard.edu/about](https://www.harvard.edu/about/) | 5 | "fundada em 1636, em Cambridge, Massachusetts" |
| 24.519 alunos undergrad + grad | harvard.edu/about | 5 | Citar com fonte+ano apenas se necessário |
| 20.667 corpo docente + staff | harvard.edu/about | 5 | Idem |
| 400.000+ alumni mundialmente | harvard.edu/about | 5 | "rede global de ex-alunos" — sem implicar acesso |
| Escolas Harvard incluem Business, Medical, Dental Medicine, T.H. Chan Public Health, Kennedy School, Law, Education, GSAS, Design, Divinity, Engineering, Kenneth C. Griffin, Radcliffe, College, Continuing Education | harvard.edu/about | 5 | "ecossistema acadêmico de Harvard" sem citar escola específica como parceira |
| ARWU ShanghaiRanking 2025 — Harvard #1 mundial (23º ano consecutivo) | [Clarivate ARWU 2025](https://clarivate.com/news/shanghairankings-academic-ranking-of-world-universities-2025/) | 5 | "ranqueada #1 mundial no ARWU ShanghaiRanking 2025" — sempre com fonte+ano visíveis |
| Top 10 ARWU 2025: Stanford 2, MIT 3, Cambridge 4, Berkeley 5, Oxford 6, Princeton 7, Columbia 8, Caltech 9, Chicago 10 | Clarivate ARWU 2025 | 5 | Contexto reforço apenas; não usar como copy principal |
| Harvard trademark/brand policy literal | trademark.harvard.edu (403) | 0 | **[UNVERIFIED]** → adotar postura defensiva: zero uso de logo/shield, disclaimer no footer |

Pesquisa Phase B encerrada — confiança ≥ 4 alcançada nos claims usados; trademark fica em postura defensiva.

---

## 5. Legal / Brand Risk Notes

### Risco Alto (block sem mitigação)
- **R1 — Implicação de afiliação Harvard.** Toda copy deve evitar: "curso oficial Harvard", "certificação Harvard", "parceria Harvard", "credenciado por Harvard", "dentro de Harvard", "Harvard endossa". Substituições seguras:
  - "experiência acadêmica em Boston, no ecossistema de Harvard"
  - "imersão internacional em uma das regiões universitárias mais prestigiadas do mundo"
  - "networking em Boston, polo das maiores instituições acadêmicas dos EUA"
  - "referência no ambiente acadêmico de Harvard" (com disclaimer)
- **R2 — Uso de logo/shield/seal Harvard.** Zero. Não baixar SVG/PNG do escudo. Não usar wordmark Harvard em arte. Texto puro "Harvard" com tipografia da landing (Playfair) está OK, com disclaimer.
- **R3 — Disclaimer obrigatório no footer.** Texto canônico do plano:
  > "Harvard é marca registrada de Harvard University. Esta experiência não implica vínculo, patrocínio, endosso ou certificação oficial por Harvard University. Referências a Harvard, Cambridge, Boston e ao ecossistema acadêmico da região têm fins exclusivamente descritivos do contexto da imersão internacional do programa OTB."
  Renderizado em `src/content/products/otb.json::legal.disclaimer` + `src/components/landing/Footer.astro`.

### Risco Médio
- **R4 — Demonstração anatômica em cadáver fresco.** Permitido como diferencial educacional. Linguagem profissional obrigatória: "demonstração anatômica avançada em cadáver fresco com foco em anatomia aplicada, segurança técnica e tomada de decisão clínica". Zero imagens explícitas, zero sensacionalismo. Venue específico flagado `[UNVERIFIED]` até confirmação institucional.
- **R5 — Claims de ranking.** Sempre citar fonte + ano ("ARWU ShanghaiRanking 2025"). Nunca "a melhor do mundo" sem qualificador. Preferir hedging seguro: "uma das instituições mais prestigiadas do mundo".

### Risco Baixo
- **R6 — Imagens Boston/Cambridge.** Imagens genéricas de skyline Boston, prédios públicos não-Harvard são seguras. Imagens reconhecíveis de prédios Harvard (Memorial Hall, Widener Library, John Harvard Statue) exigem licenciamento explícito ou substituição por alternativa genérica. Plano default = genérico Boston/Cambridge premium até licença confirmada.
- **R7 — Bandeira EUA.** Uso decorativo (acentos navy/red/white) é livre. Bandeira como background dominante = visualmente ruidoso; preferir uso pontual em badges/separadores.

---

## 6. Layer Map (ordem de dependência)

```
[Data]            src/content.config.ts                              # Zod schema (definir collection 'products')
[Data]            src/content/products/otb.json                      # toda copy + speakers + módulos + cta + legal
[Service/API]     // N/A — sem backend; landing é estática
[Router]          src/pages/otb.astro                                # rota /otb; lê getEntry('products', 'otb')
[Client/query]    // N/A — sem fetch runtime; tudo build-time via Content Collections
[Presentation]    src/layouts/Layout.astro                           # contract gpus-overlay (skip link, main#conteudo-principal, noscript, [data-reveal] observer, Google Fonts preconnect, Organization JSON-LD)
[Presentation]    src/components/landing/Hero.astro
[Presentation]    src/components/landing/WhyOTB.astro
[Presentation]    src/components/landing/TargetAudience.astro
[Presentation]    src/components/landing/Programa.astro              # ex-ExperienceSlide, sem AMWC
[Presentation]    src/components/landing/Turmas.astro
[Presentation]    src/components/landing/Modulos.astro
[Presentation]    src/components/landing/BostonHarvard.astro         # substitui DubaiExperienceSlide
[Presentation]    src/components/landing/Speakers.astro
[Presentation]    src/components/landing/Investimento.astro
[Presentation]    src/components/landing/FAQ.astro                   # CSS grid 0fr/1fr ou <details> (cardinal #8)
[Presentation]    src/components/landing/Footer.astro                # disclaimer + créditos
[Presentation]    src/components/landing/SectionDivider.astro        # acento US (navy/gold/red) sutil entre seções
[Cross-cutting]   src/lib/whatsapp.ts                                # SSOT WHATSAPP_SDR_E164 + whatsappUrlWithText() + isWhatsAppDestination()
[Cross-cutting]   src/styles/global.css                              # estender @theme com tokens us-navy + us-red opcionais (revisão)
[Cross-cutting]   src/components/landing/WhatsAppFloatingButton.tsx  # único client:load permitido (cardinal #6 + gpus-overlay)
[Cross-cutting]   public/og/otb-default.jpg                          # 1200×630 OG image
[Cross-cutting]   public/robots.txt                                  # confirmar Sitemap pointer
[Cross-cutting]   astro.config.mjs                                   # `site` já correto; sitemap não precisa filter (sem redirects para /otb)
[Verification]    bun run lint && bunx astro check && bun run build  # cardinal #2 mandatório após cada fase
[Verification]    bun run check:external-urls                        # grep e validar links externos pré-deploy
[Verification]    bun run lighthouse:audit                           # Perf/A11y/BP/SEO ≥ 95; LCP<2.5s; CLS=0; INP<100ms
```

**Auth Scope:** N/A — landing pública, sem rotas autenticadas, sem checkout interno (link sai para WhatsApp + provedor de pagamento externo `[UNVERIFIED]`).

---

## 7. Current → Proposed Copy Matrix

Notação: 🟢 Low | 🟡 Medium | 🔴 High legal risk. Conf 1-5. Todos os textos `pt-BR` premium, sentence case, sem clichês.

### Hero
| Atual (`ota-dubai/HeroSlide.tsx`) | Proposto (`otb.json::hero.*`) | Conf | Risco |
|---|---|---:|---|
| "O primeiro MBA do mundo em Business Aesthetic Health com experiência em **Dubai**" | "O primeiro MBA do mundo em **Business Aesthetic Health** com imersão internacional no ecossistema acadêmico de **Boston e Harvard**" | 4 | 🟡 |
| "3ª Turma • Vagas Limitadas" | "[Nº TURMA] Turma • Vagas limitadas" `[UNVERIFIED]` | 2 | 🟢 |
| Tags: "Certificação MEC", "320 horas", "Imersão Dubai" | Tags: "Certificação MEC", "320 horas de programa", "Boston • Estados Unidos", "Networking premium" | 4 | 🟢 |
| Subheadline ausente | "Para profissionais de Saúde Estética Avançada que querem elevar técnica, visão de negócio e posicionamento internacional." | 5 | 🟢 |
| CTA "—" (não visível) | Botão primário: "Falar com Laura no WhatsApp" → `cta.whatsappMessage = "Olá, Laura! Quero saber mais sobre a próxima turma do OTB nos Estados Unidos."` | 5 | 🟢 |

### Why OTB
| Atual | Proposto | Conf | Risco |
|---|---|---:|---|
| H1: "Por que fazer parte do **OTB**?" | "Por que **OTB Estados Unidos**?" | 5 | 🟢 |
| Card 1 "Reconhecimento Comprovado" — selo MEC + first MBA blend | "Programa Certificado" — "320 horas, 10 módulos online e imersão internacional. Certificação MEC e diferenciação real para o profissional de Saúde Estética Avançada." | 5 | 🟢 |
| Card 2 "Uma Visão Além da Técnica" — gestão estratégica | "Visão de negócio internacional" — "Business, gestão, marketing, vendas e posicionamento clínico — aprendendo a operar uma carreira premium com referência em uma das praças mais sofisticadas dos EUA." | 4 | 🟡 |
| Card 3 "Práticas Demonstrativas" — demo presencial | "Aprendizado prático em ambiente acadêmico de referência" — "Demonstração anatômica avançada em cadáver fresco, com foco em anatomia aplicada, segurança técnica e tomada de decisão clínica." | 4 | 🟡 |

### Target Audience
| Atual | Proposto | Conf | Risco |
|---|---|---:|---|
| Quote: "...rompem as barreiras do convencional." | "Idealizamos o OTB para profissionais de Saúde Estética que rompem as barreiras do convencional — e querem operar com excelência clínica, visão de negócio e referência internacional." | 5 | 🟢 |
| 6 categorias: Enfermeiros, Fisioterapeutas, Biomédicos, Odontólogos, Farmacêuticos, Médicos | Mantém 6 categorias literais. Adicionar legenda: "Profissionais habilitados conforme regulamentação do respectivo conselho de classe." | 5 | 🟢 |
| Background `dubai-desert-luxury.jpg` | Background novo: `public/images/otb/boston-cambridge-academic.jpg` (genérico Boston, sem prédios Harvard reconhecíveis) `[REQUIRES APPROVAL]` licenciamento | 3 | 🟡 |

### Programa Completo (ex-Experience)
| Atual | Proposto | Conf | Risco |
|---|---|---:|---|
| Headline: "Sua Experiência — Programa Completo" | "Seu Programa — **320 horas de formação executiva**" | 5 | 🟢 |
| Corpo: "320 horas... business avançado, gestão, marketing e vendas e experiência presencial exclusiva em Dubai" | "320 horas distribuídas entre 10 módulos online de business, gestão clínica, marketing, vendas e governança, somadas a uma imersão presencial internacional em Boston e ao redor do ecossistema acadêmico de Harvard." | 4 | 🟡 |
| 3 sub-cards: Conteúdo Online + Imersão Dubai + **AMWC Dubai** | 3 sub-cards: "Conteúdo online (10 módulos)" + "Imersão internacional em Boston" + "Demonstração anatômica avançada em cadáver fresco" | 4 | 🟡 |
| Card AMWC: "maior congresso de estética" | **REMOVER inteiro.** Sem substituto AMWC na edição EUA. | 5 | 🟢 |

### Turmas
| Atual | Proposto | Conf | Risco |
|---|---|---:|---|
| "Já estamos na terceira turma. E é só o começo." | "Já formamos turmas internacionais. Esta é a próxima fronteira." | 4 | 🟢 |
| Fotos: turma-grupo-1.jpg, turma-grupo-2.jpg | Manter fotos das turmas anteriores como prova social. Reuso direto dos arquivos do `ota-dubai` `[REQUIRES APPROVAL]` direitos de imagem dos retratados. | 3 | 🟡 |
| Datas: implícito Dubai | "[DATAS A CONFIRMAR]" — placeholder visível no JSON; UI exibe "Datas em breve" até resolver | 2 | 🟢 |

### Módulos (10)
| Atual | Proposto | Conf | Risco |
|---|---|---:|---|
| H1: "Trilha de Conteúdo — 10 módulos completos para transformar sua visão de negócio" | "Trilha de conteúdo — 10 módulos para transformar a operação do profissional de Saúde Estética" | 5 | 🟢 |
| 10 módulos: Mentalidade/Visão, Gestão Clínica, Contratação/Liderança, Marketing Relacionamento, Expansão Franquias, Educação Financeira, Sistemas & IA, Vendas, Jurídico/Contabilidade, Associações & Práticas | **Manter 10 módulos**, polir cada copy para tom premium institucional. Detalhamento card a card vai no `otb.json::modulos[]`. Cada módulo: `id`, `numero`, `titulo`, `subtitulo` (1 linha), `bullets` (3 a 5 itens). | 5 | 🟢 |

### Boston / Harvard Experience (ex-DubaiExperience)
| Atual | Proposto | Conf | Risco |
|---|---|---:|---|
| H1: "Experiência Presencial Exclusiva — Presencial em Dubai" | "Imersão internacional — Boston e o ecossistema acadêmico de Harvard" | 4 | 🟡 |
| Datas: "18-20 Outubro Dubai + 21-23 AMWC" | "[DATAS A CONFIRMAR]" — placeholder até definição. UI exibe "Próxima imersão — datas em breve". | 2 | 🟢 |
| Card 1 "Day Clinic 18/10 — demonstration" | "Demonstração anatômica avançada em cadáver fresco" — corpo: "Experiência prática demonstrativa em ambiente acadêmico internacional, com foco em anatomia aplicada, segurança técnica e tomada de decisão clínica." | 4 | 🟡 |
| Card 2 "Imersão Taj Dubai 19/10 — business talks" | "Encontros executivos no ecossistema de Boston" — "Sessões de business, gestão e posicionamento internacional em uma das praças acadêmicas mais densas do mundo." | 4 | 🟡 |
| Card 3 "Desert Luxury 20/10 — cultural + falcon/camel" | "Networking premium em Cambridge e Boston" — "Imersão cultural e profissional cercado por profissionais de alta performance e instituições de referência global." | 4 | 🟡 |
| Bonus AMWC Dubai ticket | **REMOVER.** Substituir por: "Conteúdo bônus: kit de implementação pós-imersão com playbooks de posicionamento internacional e roteiro de aplicação clínica imediata." `[ASSUMED]` — confirmar com produto | 3 | 🟢 |
| Link `amwc-dubai.com` | **REMOVER.** Sem link externo equivalente. | 5 | 🟢 |

### Speakers
| Atual | Proposto | Conf | Risco |
|---|---|---:|---|
| H1: "Nossos Palestrantes — Especialistas" | "Quem ensina — Especialistas que constroem a próxima geração da Saúde Estética" | 5 | 🟢 |
| 5 cards: Sacha (Inovação/Marketing), Ana (Empreendedorismo), Mariana (Minilift/PDO), Dieick (Harmonização), Rosana (Skin Management) com Instagram | Manter os 5 nomes + áreas. Confirmar Instagram atualizado de cada um. Adicionar bio curta (≤ 240 chars) por speaker, lida do `otb.json::speakers[]`. Foto: reusar do `ota-dubai/src/assets/speaker-*.jpg` `[REQUIRES APPROVAL]` direitos de imagem + atualização. | 3 | 🟡 |

### Investimento
| Atual | Proposto | Conf | Risco |
|---|---|---:|---|
| H1: "O MBA OTB é o seu Passaporte — para ser um profissional requisitado pelos seus pacientes" | "Investimento — O OTB é o passaporte para uma carreira internacional em Saúde Estética Avançada" | 5 | 🟢 |
| Preço: "US$ 4.000 à vista" | "Investimento à vista: **US$ 4.000**" — parcelamento crédito/boleto: condições no JSON `investimento.parcelamento[]` | 5 | 🟢 |
| 5 benefícios: Cert MEC, 320h, Dubai experience, AMWC ticket, elite network | 5 benefícios revisados: "Certificação MEC", "320 horas de programa", "Imersão internacional em Boston", "Demonstração anatômica avançada", "Networking internacional premium" | 5 | 🟢 |
| Tagline: "transformação profunda na sua carreira" | "Aplicação imediata. Posicionamento internacional. Networking de longo alcance." (substituir clichê) | 5 | 🟢 |
| CTA: ausente | CTA primário: "Falar com Laura no WhatsApp" → `cta.whatsappMessage = "Olá, Laura! Quero garantir minha vaga na próxima turma do OTB Estados Unidos."` + CTA secundário: "[CHECKOUT URL A CONFIRMAR]" | 3 | 🟢 |

### FAQ (novo — não existia em `ota-dubai`)
| Pergunta | Resposta (resumo) | Conf | Risco |
|---|---|---:|---|
| O OTB é certificado pelo MEC? | "Sim. O OTB é um programa de pós-graduação com certificação MEC." `[UNVERIFIED]` precisa confirmar credenciamento literal | 2 | 🟡 |
| Esta é uma certificação oficial Harvard? | "Não. O OTB é um programa do Grupo US. A imersão internacional acontece em Boston, na região do ecossistema acadêmico de Harvard, mas não há vínculo, patrocínio, endosso ou certificação oficial por Harvard University." | 5 | 🔴 (obrigatório) |
| Como é a demonstração em cadáver fresco? | "É uma experiência prática demonstrativa, conduzida por especialistas, com foco em anatomia aplicada, segurança técnica e tomada de decisão clínica." | 5 | 🟡 |
| O programa é só para médicos? | "Não. O OTB recebe profissionais habilitados de Saúde Estética: enfermeiros, fisioterapeutas, biomédicos, odontólogos, farmacêuticos e médicos." | 5 | 🟢 |
| Como funciona o parcelamento? | "Cartão de crédito ou boleto, condições no fechamento. Fale com Laura no WhatsApp." | 5 | 🟢 |
| Quais as datas da próxima imersão? | "Em breve. Faça parte da lista de prioridade pelo WhatsApp." `[UNVERIFIED]` | 2 | 🟢 |

### Footer
| Conteúdo |
|---|
| Logo OTB + endereço Grupo US (Goiânia) + telefone Laura (formato BR) + Instagram OTB `[UNVERIFIED]` + termos + privacidade + **disclaimer Harvard** (texto canônico R3) + créditos imagens (linha "Imagens: [licenças a confirmar]" `[REQUIRES APPROVAL]`) |

---

## 8. Asset Replacement Matrix

| Atual (`ota-dubai`) | Status | Alvo `F:\Projetos\otb-usa\public\images\otb\` | Licença | Risco | Alt text |
|---|---|---|---|---|---|
| `dubai-skyline-hero.jpg` | **descartar** | `boston-skyline-hero.jpg` (1920×1080, Boston aéreo dusk) | `[REQUIRES APPROVAL]` — Unsplash/Pexels/compra | 🟡 | "Vista aérea da cidade de Boston, Estados Unidos, ao entardecer." |
| `dubai-skyline.jpg`, `dubai-night-abstract.jpg`, `dubai-desert.jpg`, `dubai-desert-luxury.jpg`, `dubai-hotel-luxury.jpg`, `dubai-clinic-premium.jpg`, `clinic-luxury.jpg`, `amwc-event.jpg` | **descartar** | — | — | 🟢 | — |
| `turma-grupo-1.jpg`, `turma-grupo-2.jpg` | **reusar** se houver release de imagem dos retratados | mesmo nome, copiar para `public/images/otb/` | `[REQUIRES APPROVAL]` direitos de imagem dos retratados | 🟡 | "Turma do OTB reunida durante imersão internacional anterior." |
| `speaker-sacha.jpg`, `speaker-ana.jpg`, `speaker-mariana.jpg`, `speaker-dieick.jpg`, `speaker-rosana.jpg` | **reusar** com confirmação | mesmo nome + verificar resolução, copiar para `public/images/otb/speakers/` | `[REQUIRES APPROVAL]` direitos atualizados | 🟢 | "Retrato profissional de [nome speaker], especialista em [área]." |
| `otb-logo-gold.png` | **reusar** marca própria | `public/images/otb/otb-logo-gold.png` | 🟢 marca Grupo US | 🟢 | "Logo OTB em dourado." |
| `logo-otb.png` | **reusar** fallback | `public/images/otb/logo-otb.png` | 🟢 marca Grupo US | 🟢 | "Logo OTB." |
| **novo** | criar | `cambridge-academic.jpg` (1600×900, prédios genéricos Cambridge ou exterior público) | `[REQUIRES APPROVAL]` | 🟡 | "Rua de Cambridge, Massachusetts, próxima ao ecossistema acadêmico de Harvard." |
| **novo** | criar | `boston-networking-premium.jpg` (1600×900, ambiente executivo neutro) | `[REQUIRES APPROVAL]` | 🟢 | "Profissionais em sessão de networking executivo em Boston." |
| **novo** | criar | `anatomy-lab-premium.jpg` (1600×900, laboratório clínico genérico sem cadáver) | `[REQUIRES APPROVAL]` | 🟡 | "Laboratório de anatomia clínica, ambiente acadêmico." |
| **novo** | criar | `public/og/otb-default.jpg` (1200×630, hero card OTB EUA com tipografia Playfair + Navy/Gold) | criação interna | 🟢 | "Open Graph default OTB Estados Unidos." |
| **novo** | criar | `public/images/otb/us-flag-accent.svg` (vetor sutil para uso decorativo em badges/dividers) | público (bandeira EUA é pública) | 🟢 | (aria-hidden — decorativo) |

**Regras transversais:**
- Sempre `width` + `height` explícitos no `<Image>` (Astro) ou `<img>` (CLS = 0).
- Hero (acima do fold): `loading="eager"` + `fetchpriority="high"`.
- Demais: `loading="lazy"` + `fetchpriority="low"`.
- Formato preferencial: `.webp` ou `.avif` quando disponível, fallback `.jpg`. SVG apenas para ícones/vetores logos.
- **Não baixar imagem alguma durante o planejamento.** Esta matriz é shopping list para execução.

---

## 9. Recommended Approach (+ alternativas + trade-offs)

### Recomendação principal (proceder com esta)
**Landing única `/otb` em Astro estático, com SSOT em Content Collection, 11 componentes Astro modulares, 1 island React opcional (WhatsApp float), Navy/Gold preservado + acentos US discretos, disclaimer Harvard no footer.**

**Vantagens:**
- Cardinais 100% respeitados (estático MPA, copy em collection, sem hex hardcoded fora `@theme`, sem layout animation, sem SPA, sem emoji icons).
- Performance ótima: zero JS inicial além da floating button + reveal observer; LCP < 2.5s viável; INP < 100ms viável.
- Reuso completo das 12 `@utility` Navy/Gold já existentes em `global.css`.
- Migração trivial para futuras edições (Tóquio, Paris): só duplicar `otb.json` ou usar `getEntry()` com slug.
- Risco legal isolado em um único disclaimer + JSON `legal.*` (alteração trivial sob auditoria jurídica).

**Trade-offs:**
- Não migra animações Framer Motion do `ota-dubai` (avatar gradient ring, slide-in alternado). Substituídas por `@utility` + `[data-reveal]` Astro-native — perda visual marginal aceita em troca de zero React bundle.
- Componentes precisam ser construídos do zero (sem mirror existente no scaffold) — overhead inicial maior; payback após primeira página.

### Alternativa A — Migrar `ota-dubai` inteiro para `src/pages/otb-legacy.tsx` como React Island
Manter código React+Framer original como um único island gigante em Astro. **REJEITADA**: violaria cardinais #4 (sem SPA — Framer hover/scroll JS bundle grande), #5 (copy ficaria hardcoded no JSX), #7 (Tailwind v3 vs v4 = colisão de syntax), e dispararia bundle inicial > 50 KB (gate `.claude/config.json::gates.initialJsKb`).

### Alternativa B — Multi-rota com uma página por seção
`/otb`, `/otb/programa`, `/otb/modulos`, `/otb/boston`, `/otb/turmas`, `/otb/speakers`, `/otb/investimento`. **REJEITADA**: usuário escolheu single-page; fragmentação prejudica conversão high-ticket (lead precisa do contexto completo antes do CTA); SEO surface ganho é marginal vs sobrecarga de navegação.

---

## 10. Atomic Task Plan

> Ordem por camada (data → cross-cutting → presentation → verification). Cada subtarefa ≤ 5 min ou identificada com ⏱ se exceder.
> Validação após cada fase: `bun run lint && bunx astro check && bun run build` (cardinal #2).
> `[REQUIRES APPROVAL]` flagged onde aplicável (criação de dependência, ativação cardinal, asset binário).

---

### TASK-01 — Configurar Content Collection schema `[SEQUENTIAL — primeiro]`
**Layer:** data
**Goal:** Definir Zod schema da collection `products` para o slug `otb`, sem hardcodar copy em componente.
**Files:**
- `src/content.config.ts` — editar (atualmente exporta `{}`).
- `src/content/products/.gitkeep` — criar diretório.

**Steps:**
1. Importar `defineCollection`, `z` de `astro:content`.
2. Definir `products = defineCollection({ type: 'data', schema: z.object({ ... }) })` com campos:
   - `slug: z.string()`, `version: z.string()`, `locale: z.literal('pt-BR')`.
   - `seo: z.object({ title, description, ogImage, canonical })`.
   - `hero: z.object({ headline, subheadline, badges: z.array, ctaPrimary, ctaSecondary? })`.
   - `why: z.object({ headline, cards: z.array(z.object({ titulo, descricao })) })`.
   - `audience: z.object({ headline, quote, categorias: z.array, legenda })`.
   - `programa: z.object({ headline, descricao, cards: z.array, horas: z.number() })`.
   - `turmas: z.object({ headline, descricao, fotos: z.array, datas })`.
   - `modulos: z.object({ headline, lista: z.array(z.object({ numero, titulo, subtitulo, bullets })) })`.
   - `bostonHarvard: z.object({ headline, descricao, cards: z.array, datas })`.
   - `speakers: z.object({ headline, descricao, lista: z.array(z.object({ nome, area, bio, instagram, foto })) })`.
   - `investimento: z.object({ headline, descricao, preco, moeda, parcelamento: z.array, beneficios: z.array, tagline })`.
   - `faq: z.array(z.object({ pergunta, resposta }))`.
   - `cta: z.object({ whatsappMessage: z.string().startsWith('Olá, Laura!'), checkoutUrl: z.string().url().optional(), label, secondaryLabel? })`.
   - `legal: z.object({ disclaimer: z.string(), creditosImagens: z.string().optional() })`.
3. Exportar `collections = { products }`.

**Dependencies:** none
**Parallel:** [SEQUENTIAL]
**Validation:** `bunx astro check` zero erros após criação do JSON na TASK-02.
**Rollback:** revert `src/content.config.ts` para `{}`.
**Acceptance:** schema valida JSON da TASK-02 sem erro.
**Risk:** Baixo
**Approval needed:** Não

---

### TASK-02 — Criar `src/content/products/otb.json` com toda a copy `[SEQUENTIAL — após TASK-01]`
**Layer:** data
**Goal:** Single source of truth de toda copy + speakers + módulos + cta + legal disclaimer.
**Files:** `src/content/products/otb.json` — criar.

**Steps:**
1. Escrever JSON com todos os campos do schema TASK-01, populando a partir da §7 Copy Matrix (todos os textos verbatim).
2. Marcar campos `[UNVERIFIED]` (datas, número da turma, venue específico, checkoutUrl, Instagram speakers) com string `"[A CONFIRMAR]"` ou `null` consoante o schema permita.
3. `cta.whatsappMessage` começa obrigatoriamente `"Olá, Laura! "`.
4. `legal.disclaimer` = texto canônico R3 da §5.
5. `seo.title` ≤ 60 chars; `seo.description` ≥ 120 chars.

**Dependencies:** TASK-01
**Parallel:** [SEQUENTIAL]
**Validation:** `bunx astro check` zero erros Zod.
**Rollback:** delete arquivo.
**Acceptance:** JSON validado pelo schema, zero erros.
**Risk:** Médio (copy precisa revisão antes de publicação)
**Approval needed:** **Sim — revisão de copy + claims antes de publicar.**

---

### TASK-03 — Criar `src/lib/whatsapp.ts` SSOT helper `[PARALLEL com TASK-04]`
**Layer:** cross-cutting
**Goal:** Cardinal #6 — SSOT para URL WhatsApp + número Laura E.164.
**Files:** `src/lib/whatsapp.ts` — criar.

**Steps:**
1. Constantes:
   - `export const WHATSAPP_SDR_E164 = '556294705081';`
   - `export const WHATSAPP_DEFAULT_MESSAGE = 'Olá, Laura! Gostaria de falar sobre os programas do Grupo US e qual faz sentido para o meu momento.';`
2. Funções:
   - `export function whatsappUrlWithText(message: string): string` — encodeURIComponent + base `https://wa.me/${WHATSAPP_SDR_E164}?text=`.
   - `export function isWhatsAppDestination(url: string): boolean` — regex `/^https?:\/\/(wa\.me|api\.whatsapp\.com)/`.
3. Asserção `if (!message.startsWith('Olá, Laura!')) throw new Error('CTA must start "Olá, Laura!"');` no build (ou checagem soft em dev).

**Dependencies:** none
**Parallel:** [PARALLEL com TASK-04]
**Validation:** `bunx astro check`; grep `wa\.me/\|api\.whatsapp\.com` retorna apenas referências dentro de `src/lib/whatsapp.ts`.
**Rollback:** delete arquivo.
**Acceptance:** `whatsappUrlWithText('Olá, Laura! teste')` retorna URL válida; throw em mensagem sem prefixo.
**Risk:** Baixo
**Approval needed:** Não

---

### TASK-04 — Criar `src/layouts/Layout.astro` contract `[PARALLEL com TASK-03]`
**Layer:** presentation (cross-cutting)
**Goal:** Layout institucional com skip link, main#conteudo-principal, noscript, [data-reveal] observer, Google Fonts preconnect, Organization JSON-LD. Contrato `astro/references/gpus-overlay.md § Layout.astro contracts`.
**Files:** `src/layouts/Layout.astro` — criar.

**Steps:**
1. Frontmatter aceita props: `title`, `description`, `ogImage`, `canonical`, `jsonLd?`.
2. `<html lang="pt-BR">`.
3. `<head>` inclui:
   - `<meta charset>`, `<meta viewport>`.
   - Preconnect `https://fonts.googleapis.com` + `https://fonts.gstatic.com`.
   - Importar fontes Astro 6 via `getFontData()` (Playfair Display + Inter).
   - Meta OG/Twitter (default OG image `public/og/otb-default.jpg` placeholder).
   - JSON-LD Organization (Grupo US): @context schema.org, name "Grupo US", url `productionUrl`, logo, contactPoint Laura E.164.
4. `<body>`:
   - `<a class="skip-link" href="#conteudo-principal">Pular para o conteúdo</a>` — primeiro focusable.
   - `<noscript><style>[data-reveal]{opacity:1!important;}</style></noscript>` — fallback JS-off.
   - `<main id="conteudo-principal" tabindex="-1"><slot /></main>`.
   - Script inline IntersectionObserver para `[data-reveal]` → adiciona `.revealed`.
   - Slot opcional `<slot name="floating" />` para `WhatsAppFloatingButton`.
5. Importar `src/styles/global.css`.

**Dependencies:** none
**Parallel:** [PARALLEL com TASK-03]
**Validation:** acessibilidade manual — Tab leva primeiro à skip link; JS-off mostra todo `[data-reveal]`.
**Rollback:** delete arquivo.
**Acceptance:** contrato gpus-overlay 100% atendido.
**Risk:** Médio
**Approval needed:** Não

---

### TASK-05 — Criar `src/components/landing/Hero.astro` `[PARALLEL com TASK-06..14]`
**Layer:** presentation
**Goal:** Hero asymmetric, lê `otb.json::hero`, anima reveal-up, usa `@utility landing-mesh-bg` + `text-shimmer` + `gold-glow` no CTA. Background image Boston `[UNVERIFIED]` até licença.
**Files:** `src/components/landing/Hero.astro` — criar.

**Steps:**
1. `getEntry('products', 'otb')` no frontmatter.
2. Renderizar headline (Playfair), subheadline (Inter), array de badges (icon Lucide React via island `client:idle` opcional ou SVG inline).
3. CTA primário: `<a href={whatsappUrlWithText(data.cta.whatsappMessage)}>` com `gold-glow` + `glass-card-bright`.
4. Asymmetric grid `lg:grid-cols-12` (8/4 split). Imagem hero direita ou top-mobile, com `width`/`height`/`fetchpriority="high"`/`loading="eager"`.
5. `data-reveal="up"` no headline; `data-reveal="up" data-reveal-delay="2"` no subhead; etc.

**Dependencies:** TASK-01, TASK-02, TASK-04
**Parallel:** [PARALLEL]
**Validation:** visual desktop+mobile; LCP < 2.5s.
**Rollback:** delete.
**Acceptance:** componente compila, lê do JSON, sem hardcode.
**Risk:** Baixo
**Approval needed:** Não

---

### TASK-06 — `src/components/landing/WhyOTB.astro` `[PARALLEL]`
3 cards `glass-card` + `card-hover-lift` + `card-glow-hover`. Lê `data.why.cards[]`. `data-reveal="up"` stagger.

### TASK-07 — `src/components/landing/TargetAudience.astro` `[PARALLEL]`
Quote em destaque + grid 2×3 ou 3×2 com 6 categorias. Lucide icons. Background `cambridge-academic.jpg` decorativo com overlay navy.

### TASK-08 — `src/components/landing/Programa.astro` `[PARALLEL]`
Headline + corpo + 3 sub-cards (online/imersão/demonstração). **Sem AMWC.** Reveal stagger.

### TASK-09 — `src/components/landing/Turmas.astro` `[PARALLEL]`
2 fotos turma + headline. Fotos `loading="lazy"`. `[REQUIRES APPROVAL]` reuso direitos de imagem.

### TASK-10 — `src/components/landing/Modulos.astro` `[PARALLEL]`
Lista numerada 10 módulos. Layout alternado (par esquerda, ímpar direita) usando CSS `:nth-child(even)` + `[data-reveal="left|right"]`.

### TASK-11 — `src/components/landing/BostonHarvard.astro` `[PARALLEL]`
3 cards (Demonstração anatômica / Encontros executivos / Networking premium). Sem link AMWC. Datas placeholder. Background `boston-networking-premium.jpg`.

### TASK-12 — `src/components/landing/Speakers.astro` `[PARALLEL]`
5 cards speaker. Avatar com gradient ring (`@utility text-gradient-gold` adaptado para borda — adicionar nova `@utility gradient-border-gold` em `global.css` se necessário). Bio + Instagram link `target="_blank" rel="noopener noreferrer"`.

### TASK-13 — `src/components/landing/Investimento.astro` `[PARALLEL]`
Preço grande Playfair + tabular-nums. 5 benefícios check-marked (Lucide `Check`). 2 CTAs (WhatsApp primário + checkout secundário `[UNVERIFIED]`). `glass-card-bright` no card de preço.

### TASK-14 — `src/components/landing/FAQ.astro` `[PARALLEL]`
**Cardinal #8 obrigatório.** Native `<details><summary>` OU CSS grid `grid-template-rows: 0fr ↔ 1fr` + `aria-expanded`. Animar **apenas** chevron (rotate transform). Lê `data.faq[]`. Schema.org FAQPage JSON-LD inline.

### TASK-15 — `src/components/landing/Footer.astro` `[PARALLEL]`
Logo OTB + endereço + Instagram + termos + privacidade + **disclaimer Harvard** (texto canônico R3) + créditos imagens. Sem hardcode — lê de `data.legal.*`.

### TASK-16 — `src/components/landing/WhatsAppFloatingButton.tsx` (island) `[PARALLEL]`
**Único `client:load` permitido.** Botão fixed bottom-right. Lucide `MessageCircle`. `aria-label="Falar com Laura no WhatsApp"`. Lê `WHATSAPP_DEFAULT_MESSAGE` de `src/lib/whatsapp.ts`. Hidden em mobile abaixo de 480px se quebrar layout (opcional).

### TASK-17 — `src/components/landing/SectionDivider.astro` `[PARALLEL]`
Separador opcional sutil (navy/gold gradient + filete US navy 1px). Decorativo, `aria-hidden`.

---

### TASK-18 — Estender `src/styles/global.css` se necessário `[SEQUENTIAL — após audit dos components]`
**Layer:** cross-cutting
**Goal:** Adicionar tokens `--color-us-navy-deep`, `--color-us-red-discrete` ao `@theme` block se aceitos no Recommended Approach. Não substituir Navy/Gold; apenas acentos.
**Files:** `src/styles/global.css` — editar bloco `@theme`.

**Steps:**
1. Auditar componentes (TASK-05..17): qual `@utility` falta?
2. Adicionar tokens novos no `@theme` bloco existente, mantendo Navy/Gold como base.
3. Adicionar `@utility gradient-border-gold`, `@utility us-accent-stripe` se necessário.
4. Validar `grep -rn "bg-\[#\|text-\[#\|border-\[#" src/` retorna vazio.

**Dependencies:** TASK-05..17
**Parallel:** [SEQUENTIAL]
**Validation:** lint + check + build.
**Acceptance:** zero hex fora `@theme`; cardinal #7 honrado.
**Risk:** Baixo
**Approval needed:** Não

---

### TASK-19 — Criar `src/pages/otb.astro` rota `[SEQUENTIAL — após TASK-04..17]`
**Layer:** router
**Goal:** Compor a página `/otb` lendo do Content Collection, importando todos os componentes em ordem.
**Files:** `src/pages/otb.astro` — criar.

**Steps:**
1. Frontmatter:
   - `import Layout from '../layouts/Layout.astro';`
   - Imports dos 11 componentes landing.
   - `const otb = await getEntry('products', 'otb');`
2. `<Layout title={otb.data.seo.title} description={otb.data.seo.description} ogImage={otb.data.seo.ogImage}>`.
3. Renderizar componentes em ordem: `<Hero />` → `<WhyOTB />` → `<TargetAudience />` → `<Programa />` → `<Turmas />` → `<Modulos />` → `<BostonHarvard />` → `<Speakers />` → `<Investimento />` → `<FAQ />` → `<Footer />`.
4. `<Fragment slot="floating"><WhatsAppFloatingButton client:idle /></Fragment>` — usar `client:idle` em vez de `client:load` quando possível (revisão final em verify).
5. Passar `otb` por props para cada componente, ou cada componente faz seu próprio `getEntry()` (preferível: única chamada em otb.astro + props).

**Dependencies:** TASK-04..17
**Parallel:** [SEQUENTIAL]
**Validation:** `bun run dev` → http://localhost:4321/otb → todas seções renderizam.
**Rollback:** delete.
**Acceptance:** página renderiza com zero erros console + LCP < 2.5s.
**Risk:** Médio
**Approval needed:** Não

---

### TASK-20 — Criar assets diretório + OG image + favicon checks `[PARALLEL com TASK-19]`
**Layer:** cross-cutting
**Goal:** Estrutura de assets em `public/images/otb/` + OG image padrão.
**Files:**
- `public/images/otb/.gitkeep` — criar (placeholder).
- `public/og/otb-default.jpg` — `[REQUIRES APPROVAL]` criação.

**Steps:**
1. Criar `public/images/otb/` + subdir `speakers/`.
2. Copiar logos OTB (`otb-logo-gold.png`, `logo-otb.png`) de `F:\Projetos\ota-dubai\src\assets\` para `F:\Projetos\otb-usa\public\images\otb\`.
3. **Não copiar** imagens Dubai/AMWC/desert.
4. Listar imagens necessárias da §8 que ficam pendentes de aquisição (`[REQUIRES APPROVAL]`).
5. OG image criação: encomendar peça 1200×630 Playfair Display "OTB Estados Unidos" + tagline + Navy/Gold + logo OTB.

**Dependencies:** none
**Parallel:** [PARALLEL com TASK-19]
**Validation:** `ls public/images/otb/` mostra ≥ 2 logos + estrutura.
**Rollback:** delete.
**Acceptance:** estrutura existe, logos copiados.
**Risk:** Baixo
**Approval needed:** **Sim — cada asset binário fora dos logos OTB.**

---

### TASK-21 — Atualizar `astro.config.mjs` site URL + sitemap (se necessário) `[OPTIONAL]`
**Layer:** router/build
**Goal:** Garantir `site` aponta para URL correta. Sem redirects necessários (não há slug duplo).
**Files:** `astro.config.mjs` — editar **(arquivo protegido — autorização explícita necessária)**.

**Steps:**
1. Confirmar `site: 'https://harmonic-pascal.grupous.com.br'` está coerente com produção esperada para OTB EUA. Se OTB EUA tem domínio próprio (ex: `otb.grupous.com.br`), atualizar.
2. Sitemap padrão (`sitemap()` sem filter) já gera `/otb` corretamente — verificar build output.
3. **Não adicionar redirects** — `/otb` é canônico, sem alias.

**Dependencies:** decisão de domínio
**Parallel:** [OPTIONAL]
**Validation:** `bun run build`; `cat dist/sitemap-*.xml | grep '/otb'`.
**Acceptance:** sitemap inclui `/otb`.
**Risk:** Médio (protected file)
**Approval needed:** **Sim — autorização explícita conforme `.claude/config.json::protectedFiles`.**

---

### TASK-22 — Validação completa `[SEQUENTIAL — final]`
**Layer:** verification
**Goal:** Smoke + cardinal compliance + perf gate.
**Files:** N/A.

**Steps:**
1. `bun run lint` zero erros.
2. `bunx astro check` zero erros.
3. `bun run build` exit 0.
4. `bun run check:external-urls` confirma todos os links externos respondem.
5. Greps cardinais:
   - `grep -rn "Dubai\|AMWC\|amwc" src/ public/` → vazio (exceto eventual ref histórica em docs/).
   - `grep -rn "wa\.me\|api\.whatsapp\.com" src/components src/pages` → vazio (todas URLs via `src/lib/whatsapp.ts`).
   - `grep -rn "bg-\[#\|text-\[#" src/` → vazio.
   - `grep -rn "client:load" src/` → ≤ 1 hit (WhatsAppFloatingButton, ou zero se TASK-19 trocou para `client:idle`).
   - `grep -rn "prerender = false\|ClientRouter\|@astrojs/node" src/ astro.config.mjs` → vazio.
   - `grep -rn "🇺🇸\|📚\|💼" src/components src/pages` → vazio (cardinal #3 — sem emoji icons).
6. `bun run dev` → manual:
   - Tab leva à skip link primeiro.
   - JS-off (DevTools) → todas seções aparecem.
   - DevTools Rendering → "Emulate prefers-reduced-motion: reduce" → animações off.
   - Mobile 360px, tablet 768px, desktop 1280px → responsive OK.
7. `bun run lighthouse:audit` → Perf/A11y/BP/SEO ≥ 95; LCP < 2.5s; CLS = 0; INP < 100ms.

**Dependencies:** TASK-19, TASK-20, opcional TASK-21
**Parallel:** [SEQUENTIAL]
**Validation:** todos os greps + gates passam.
**Acceptance:** Lighthouse ≥ 95 nas 4 dimensões + zero violações cardinais.
**Risk:** Alto se falhar — invocar `/debug recover`.
**Approval needed:** Não

---

## 11. Validation Plan

Comandos exatamente como em `package.json` (sem inventar):

| Estágio | Comando | Threshold |
|---|---|---|
| Type-check | `bunx astro check` | zero erros |
| Lint | `bun run lint` | zero erros biome + oxlint |
| Build | `bun run build` | exit 0; `dist/index.html` + `dist/otb/index.html` + `dist/sitemap-*.xml` |
| External URLs | `bun run check:external-urls` | todos os links 200/3xx |
| CWV pós-build | `bun run lighthouse:audit` | Perf/A11y/BP/SEO ≥ 95; LCP < 2.5s; CLS = 0; INP < 100ms; initialJS < 50 KB |

### Smoke greps obrigatórios (todos vazios após TASK-22)
```bash
grep -rn "Dubai\|AMWC\|dubai\|amwc" src/ public/
grep -rn "wa\.me/\|api\.whatsapp\.com" src/components src/pages
grep -rn "bg-\[#\|text-\[#\|border-\[#" src/
grep -rn "prerender = false\|ClientRouter" src/ astro.config.mjs
grep -rn "🇺🇸\|📚\|💼\|🏛" src/components src/pages
grep -rnE "transition.*\b(width|height|top|left|padding|margin)\b" src/styles
```

### Manual checklists (browser)
- Tab 1× a partir do topo → foco na skip link visível.
- Enter na skip link → foco salta para `<main>` com outline visível.
- FAQ expand: Enter/Space abre, Escape colapsa, sem layout shift visível.
- WhatsApp button: clicar abre `https://wa.me/556294705081?text=...` em nova aba.
- Disable JS: hero renderiza + todas seções aparecem (zero reveal hidden).
- prefers-reduced-motion ON: mesh-drift parado, shimmer parado, reveal sem animação.
- 360/768/1280: responsivo, sem overflow horizontal, CTA sticky em mobile (se aplicável).

### Legal / copy review
- Re-grep `Harvard` em `src/content/products/otb.json` → toda ocorrência tem fonte conhecida ou aparece junto do disclaimer.
- Disclaimer no Footer renderiza visível (não escondido em modal).
- Speakers Instagram links abrem `rel="noopener noreferrer"`.

---

## 12. Risks & Rollback (top 5)

| # | Risco | Impacto | Mitigação | Rollback |
|---|---|---|---|---|
| **R1** | Claim de afiliação Harvard escapar em alguma copy | Alto (legal) | Disclaimer no Footer + revisão grep `Harvard` antes de cada deploy + auditoria por terceiro pré-go-live | Editar `otb.json` (1 commit) — sem reverter componentes |
| **R2** | Imagem com licença não confirmada vazar para produção | Médio (legal/marca) | `[REQUIRES APPROVAL]` em cada asset binário; placeholder gradient/SVG até licença | Substituir asset; manter `<img>` com width/height para zero CLS |
| **R3** | Bundle inicial > 50 KB por dependência inesperada | Médio (perf gate) | `client:idle` em vez de `client:load` no botão WhatsApp; Lucide named imports; nenhum Framer Motion | Auditar `dist/_astro/*.js`; remover island ofensora |
| **R4** | Mensagem WhatsApp sem prefixo "Olá, Laura!" passar em PR | Médio (SSOT brand) | Assert no `whatsappUrlWithText()` (throw em build) + grep CI | Editar `otb.json::cta.whatsappMessage` |
| **R5** | `bun run build` falha por schema Zod estrito em TASK-02 | Baixo (DX) | Validar incrementalmente: TASK-01 → TASK-02 → `bunx astro check` antes de TASK-03+ | Ajustar schema (opcional) ou completar JSON |

---

## 13. Acceptance Criteria

- [ ] `bun run lint && bunx astro check && bun run build` → exit 0.
- [ ] `dist/otb/index.html` existe + contém todas as 10 seções (Hero, Why, Audience, Programa, Turmas, Modulos, BostonHarvard, Speakers, Investimento, FAQ, Footer).
- [ ] Toda copy lida de `src/content/products/otb.json` — zero string literal de produto em `.astro`/`.tsx` (cardinal #5).
- [ ] Disclaimer Harvard presente no rodapé renderizado.
- [ ] Zero ocorrências `Dubai|AMWC` em `src/` + `public/`.
- [ ] Zero `wa.me` fora de `src/lib/whatsapp.ts`.
- [ ] Zero hex fora `src/styles/global.css` `@theme` (cardinal #7).
- [ ] Zero emoji UI icon (cardinal #3).
- [ ] Zero `ClientRouter` / `prerender = false` / SSR adapter (cardinal #4).
- [ ] FAQ usa `<details>` ou CSS grid `0fr/1fr` — sem animação de `height` (cardinal #8).
- [ ] Lighthouse Perf/A11y/BP/SEO ≥ 95 em `/otb`.
- [ ] LCP < 2.5s, CLS = 0, INP < 100ms.
- [ ] JS inicial < 50 KB.
- [ ] Skip link é primeiro focusable.
- [ ] JS-off mostra todas seções (noscript reveal fallback).
- [ ] `prefers-reduced-motion: reduce` desativa todas animações.
- [ ] OG image padrão existe em `public/og/otb-default.jpg` (ou placeholder até licença).
- [ ] Speaker Instagram links têm `rel="noopener noreferrer"`.

---

## 14. Implementation Order

```
Phase 0 — Foundations (SEQUENTIAL)
  TASK-01  Content Collection schema
  TASK-02  otb.json (Copy SSOT)         ← REQUIRES APPROVAL: copy review
  TASK-03  whatsapp.ts SSOT              ┐
                                         ├ PARALLEL com TASK-04
  TASK-04  Layout.astro contract         ┘

Phase 1 — Components (PARALLEL — 13 componentes)
  TASK-05  Hero
  TASK-06  WhyOTB
  TASK-07  TargetAudience
  TASK-08  Programa (ex-Experience, sem AMWC)
  TASK-09  Turmas                       ← REQUIRES APPROVAL: image rights
  TASK-10  Modulos
  TASK-11  BostonHarvard (ex-Dubai)
  TASK-12  Speakers                     ← REQUIRES APPROVAL: speaker bios+fotos
  TASK-13  Investimento                 ← REQUIRES APPROVAL: checkout URL
  TASK-14  FAQ (cardinal #8)
  TASK-15  Footer (disclaimer Harvard)
  TASK-16  WhatsAppFloatingButton (island, client:idle)
  TASK-17  SectionDivider (opcional)

Phase 2 — Theme tokens (SEQUENTIAL após audit)
  TASK-18  Estender global.css se necessário

Phase 3 — Composição + assets (PARALLEL)
  TASK-19  otb.astro page
  TASK-20  Assets dir + OG image + logos copy  ← REQUIRES APPROVAL: licenciamento

Phase 4 — Config & Domain (OPTIONAL)
  TASK-21  astro.config.mjs site URL  ← REQUIRES APPROVAL: protected file

Phase 5 — Validation (SEQUENTIAL — gate de aceite)
  TASK-22  Lint + check + build + lighthouse + smoke greps + manual a11y
```

---

## Context Handoff

```markdown
## Context Handoff
- Status: COMPLETED (planning)
- Confidence: 4
- Artifacts:
  - { path: "docs/e-design-claude-golden-crown.md", action: "created (this plan)" }
- Quality gates:
  - { name: "Codebase research (target + source)", status: "PASS", evidence: "2 Explore agents, file:line citations" }
  - { name: "External claims verification", status: "PARTIAL", evidence: "Harvard /about confirmed; trademark.harvard.edu 403 — defensive posture adopted" }
  - { name: "Brand SSOT alignment", status: "PASS", evidence: "grupo-us skill confirms OTB MBA = Boston/Harvard/Fresh Specimens" }
  - { name: "User clarifications", status: "PASS", evidence: "4 AskUserQuestion decisions recorded" }
  - { name: "Cardinal compliance design", status: "PASS", evidence: "All 8 cardinals mapped to acceptance criteria" }
- Decisions:
  - { what: "Single page /otb (vs replace index or multi-route)", why: "User-confirmed; matches AGENTS.md routing matrix; preserves index.astro for future home" }
  - { what: "Harvard mention + footer disclaimer", why: "Brand SSOT cites Boston/Harvard; legal trademark 403 → defensive posture; disclaimer mandatory" }
  - { what: "Reuse OTB logos + 5 speakers + 10 modules + US$ 4.000", why: "User-confirmed; speakers + photos need approval pass before publication" }
  - { what: "Fresh Specimens professional mention", why: "User-confirmed; venue [UNVERIFIED] until institutional confirmation" }
  - { what: "Astro static MPA + Content Collections + 11 components + 1 island", why: "Cardinal compliance; max perf; zero Framer Motion bundle" }
- Risks:
  - { desc: "Harvard affiliation overclaim", mitigation: "Footer disclaimer + grep before each deploy" }
  - { desc: "Asset licensing leak", mitigation: "[REQUIRES APPROVAL] on every binary asset" }
  - { desc: "Bundle > 50 KB", mitigation: "client:idle + named Lucide imports" }
  - { desc: "Brand SSOT WhatsApp prefix drift", mitigation: "Assert in whatsappUrlWithText() + grep CI" }
- Next agent: project-planner OR frontend-specialist (via /implement docs/e-design-claude-golden-crown.md after approval)
- Resume hint: After approval, execute Phase 0 (TASK-01..04) sequentially; then spawn frontend-specialist for Phase 1 components in parallel batch.
```

---

## Self-Check (✅ todos atendidos)

- ✅ Codebase researched before web (2 Explore agents, file:line citations).
- ✅ LEVER aplicado — reusar `@utility` existentes (`gold-glow`, `glass-card`, `landing-mesh-bg`, `text-shimmer`, `[data-reveal]`), reusar logos OTB, reusar 10 módulos.
- ✅ Layers em dependência: data → cross-cutting → presentation → router → verification.
- ✅ N/A layers dropados: Service/API (sem backend), Client/query (sem fetch runtime), Auth (landing pública).
- ✅ 22 tasks atomic + testáveis (subtarefas ≤ 5 min ou flagadas).
- ✅ Assumptions todas labeled `[ASSUMED]` ou `[UNVERIFIED]`.
- ✅ Nenhuma implementação executada (planning-only).
- ✅ Destructive ops flagadas `[REQUIRES APPROVAL]` (protected files, copy publication, asset licensing).
- ✅ Validation commands literais de `package.json` (zero invenção).
- ✅ 8 cardinais project-specific honrados na arquitetura proposta.
- ✅ Confidence ≤ 2 flagada em datas, turma, venue, checkout, Instagram, OTB credenciamento MEC.
- ✅ Harvard/legal claims: postura defensiva — verificações `harvard.edu/about` conf 5; trademark 403 → disclaimer obrigatório.
- ✅ AMWC removida completamente.
- ✅ Dubai residue mapeado e replacement matrix entregue.
- ✅ Assets: matriz de licença completa, sem download.
- ✅ Copy conversion-focused: cada CTA aponta para WhatsApp Laura com mensagem específica.

---

**Próximo passo:** Após aprovação do plano via `ExitPlanMode`, executar `/implement docs/e-design-claude-golden-crown.md` para iniciar Phase 0 (TASK-01..04 sequenciais). Phase 1 (TASK-05..17) pode ser paralelizada por `frontend-specialist` batch após Phase 0 completar e validar.
