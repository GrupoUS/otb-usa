<answer>
  <reasoning>
    Root cause: a landing ainda orientada a HubSpot criava desalinhamento entre promessa, CTA e oferta canônica do checkout. Hipóteses avaliadas: (1) alinhar oferta + CTA ao checkout aumentaria clareza comercial; (2) um title dedicado melhoraria coerência SERP/H1/CTA; (3) FAQ de compra reduziria fricção sem precisar expor preço variável. Escolha: aplicar um patch mínimo em conteúdo + title + microcopy de CTA compartilhado, preservando WhatsApp apenas como suporte.
  </reasoning>
  <baseline>
    headline matches search / buyer intent? parcial
    CTA names action and outcome? no
    page has title/meta/H1 alignment? no
    proof / trust / differentiation visible above the fold? parcial
    commands run before change: `bun run lint`; `bunx astro check`; `bun run build`
  </baseline>
  <experiment>
    <tag>2026-03-25-checkout-cta</tag>
    <branch>autoresearch/2026-03-25-checkout-cta</branch>
    <hypothesis>Se a landing vender explicitamente o Curso de Aurículo com Técnica de Perfuração Auricular e levar o CTA principal direto para a Kiwify, a clareza comercial e a intenção de inscrição ficam mais fortes sem remover o WhatsApp de suporte.</hypothesis>
    <files>src/content/products/curso-auriculo.json, src/pages/curso-auriculo.astro, src/components/landing/LandingCTA.astro</files>
    <patch_summary>Troca do CTA principal para a Kiwify, reescrita da oferta/hero/FAQ para casar com o checkout e ajuste do title + microcopy do CTA final para um funil checkout-first.</patch_summary>
  </experiment>
  <validation>
    <commands>bun run lint; bunx astro check; bun run build; confirmar no HTML gerado a presença de `https://pay.kiwify.com.br/kMXdriO` e da nova microcopy</commands>
    <expected>Metric improved</expected>
    <decision>keep</decision>
  </validation>
  <log_entry>
    ### [2026-03-25] Curso de Aurículo: checkout-first com Kiwify + FAQ de compra
    **Hypothesis:** alinhar oferta + CTA ao checkout canônico aumentaria clareza comercial da landing.
    **Result:** CTA explícito: no → yes; title/meta/H1 alinhados: no → yes; decisão: keep.
    **Pattern:** quando a venda canônica é externa, usar checkout-first no botão principal e WhatsApp apenas para suporte pré-inscrição.
    **Validation:** `bun run lint && bunx astro check && bun run build`
  </log_entry>
  <next_suggested>Criar e testar um asset raster específico para Open Graph do curso antes de passar `ogImage={d.image}`.</next_suggested>
</answer>
