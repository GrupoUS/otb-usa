# Conflitos entre fontes — como decidir

Consultar este arquivo antes de afirmar datas, locais, preços ou prazos.

## Hierarquia (resumo)

1. **Tom, IDs e roteiro de vendas / IA interna** → Manual Google Docs (`manual-resumo.md`).  
2. **Copy e estrutura publicada no site institucional Astro** → `src/content/products/*.json` + [AGENTS.md](../../../../AGENTS.md) (sem hardcode fora das collections).  
3. **URLs e CTAs do funil ao vivo** → páginas em `https://drasacha.com.br/` e links nas próprias JSON (`cta.url`, `externalSiteUrl`).  
4. **Cultura A.C.T.I.V.A.** → Notion (`cultura-activa.md`).

Se duas fontes discordam, **não fundir** em uma única frase: citar a fonte ou dizer que há divergência e recomendar confirmação no canal oficial.

---

## OTB — local da imersão internacional

| Fonte | O que diz |
|-------|-----------|
| Manual Google Doc | Boston / Harvard, Fresh Specimens, imersão EUA. |
| drasacha.com.br (vitrine capturada no planejamento) | Dubai, injeção e dissecção em Fresh Specimens. |
| `src/content/products/otb.json` + `astro.config.mjs` | `externalSiteUrl` / redirect: `https://ota-dubai.lovable.app/` |

**Decisão:** Para **URL de inscrição e produto ligado ao repo**, usar **JSON + redirect**. Para **copy de autoridade “Harvard/Boston”**, só usar se o manual for a fonte explícita da tarefa; caso contrário alinhar com marketing antes de publicar.

---

## TRINTAE3 — duração / promessa temporal

| Fonte | O que diz |
|-------|-----------|
| Manual (seção produto detalhada) | ~**6 meses** para conclusão e certificação (variável por ritmo). |
| Manual (resumo inicial) | Promessa comercial “em 6 meses” (dominar mercado / faturar mais). |
| `src/content/products/trintae3.json` (FAQ) | Duração do programa **18 meses**, encontros mensais presenciais + online. |

**Decisão:** No **site institucional**, usar apenas o que está na **Content Collection**. Em **vendas/IA** guiada pelo manual, usar o que o stakeholder fixar; se ambos aparecem, declarar que há duas linhas temporais e **não inventar** unificação.

---

## Neon Dash

Presente em `src/content/products/neon-dash.json` e rota `/neon-dash` no site institucional. **Não** aparece na lista dos seis produtos com IDs no início do Manual de Inteligência.

**Decisão:** Tratar como oferta **oficial no canal institucional**; para IDs `produto_*` do manual, marcar como pendente de alinhamento documental.

---

## Preços e parcelamento

O manual traz valores **aproximados** e “sujeitos a alteração”.

**Regra:** Nunca inventar preço ou parcela. Orientar o usuário final a **confirmar na página oficial**, no WhatsApp de vendas ou no time comercial. Se citar números do manual, rotular como **referência do documento interno**, não como preço final.

---

## Site institucional vs vitrine Dra. Sacha

- Deploy Astro (canonical configurado): `https://grupous.com.br` — ver [astro.config.mjs](../../../../astro.config.mjs) `site`.  
- Vitrine de produtos e LPs: `https://drasacha.com.br/` e subdomínios citados no manual.

**Decisão:** CTAs “oficiais” para o ecossistema podem divergir entre domínios; priorizar o **link da tarefa** (institucional vs drasacha) e o campo `cta.url` / `externalSiteUrl` do JSON quando a tarefa for o repo.
