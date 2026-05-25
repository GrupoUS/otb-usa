# Curso de Auriculo conversion — compound

Reutilizar em próximos ciclos de autoresearch comercial da rota `/curso-auriculo`.

## Padrões que funcionam

- **Checkout-first claro no CTA primário:** quando o destino canônico é uma página de vendas externa, usar verbo direto de compra/inscrição no `cta.label` e deixar o WhatsApp apenas como suporte para dúvidas.
- **Oferta do hero, meta e FAQ deve espelhar o checkout:** se a venda acontece como “Curso de Aurículo com Técnica de Perfuração Auricular”, a landing precisa repetir essa combinação no `description`, `hero` e perguntas frequentes.
- **FAQ de compra reduz fricção sem inventar preço:** incluir resposta explícita sobre como se inscrever e como usar o WhatsApp antes da compra aumenta clareza comercial sem depender de lotes ou parcelamento variáveis.
- **Title dedicado na página Astro:** trocar `name — Grupo US` por um title orientado à intenção de busca melhora o alinhamento entre SERP, H1 e CTA.
- **Headline com transformação + prazo + contexto inicial:** para esta oferta, a fórmula "resultado + em 3 dias + sem depender de formação longa/custo alto" ficou mais forte do que uma headline genérica sobre crescimento de mercado.
- **Âncora temporal nas primeiras palavras do H1:** abrir com “Em 3 dias presenciais,” (ou equivalente) melhora escaneabilidade antes do fecho com o nome do curso; manter oferta (auriculoterapia + perfuração) visível no mesmo bloco.
- **CTA em primeira pessoa com tempo explícito:** “Quero me inscrever agora” comunica ação imediata sem inventar escassez; continuar nomeando checkout no helper e na FAQ de inscrição.
- **Tagline como qualificação antes do H1:** usar a `tagline` visível no `LandingHero` ajuda o visitante a se identificar rapidamente antes de ler a promessa principal.
- **Helper text opcional no CTA:** `cta.helperText` perto do botão principal reduz risco percebido ao explicar onde ver investimento, lote e formas de pagamento, sem competir com o CTA.
- **FAQ na ordem da decisão:** fit -> o que inclui -> formato/esforço -> comparação com próxima etapa do ecossistema -> condições comerciais -> canal para dúvidas.

## O que preservar

- `cta.url` em `src/content/products/curso-auriculo.json` apontando para `https://pay.kiwify.com.br/kMXdriO`.
- `LandingCTA` com microcopy que explica o papel do botão principal quando `cta.url` não é WhatsApp.
- `whatsappMessage` com contexto de pré-inscrição, não de venda principal.
- `cta.helperText` como texto operacional curto e escaneável; não usar para urgência falsa, preço fixo ou promessas não validadas.
- `LandingHero` exibindo `tagline` acima do H1 quando ela ajudar a qualificar o visitante.

## Conhecimento pendente

- O produto ainda usa `image` SVG, então o preview social permanece no fallback do `Layout`; vale testar um asset raster dedicado antes de passar `ogImage={d.image}`.
- Ainda falta medir CTR/qualidade de lead após deploy em canal real.
- Se houver dados reais de perguntas da Laura ou abandono de checkout, transformar essas dúvidas em novas FAQs ou microcopys perto do CTA.
