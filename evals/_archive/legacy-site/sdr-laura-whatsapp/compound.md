# SDR Laura — WhatsApp (compound)

## Fonte única

- **`src/lib/whatsapp.ts`**: `WHATSAPP_SDR_E164` (`556294705081`), `whatsappUrlWithText(message)`, `whatsappUrlBase`, `WHATSAPP_DEFAULT_SITE_MESSAGE`.
- Ao mudar número ou mensagem padrão institucional, editar só este arquivo + JSON-LD em `Layout.astro` + texto visível no `Footer.astro`.

## Padrão de conversão

- **Landings:** botão secundário verde = `whatsappUrlWithText(cta.whatsappMessage)`; mensagens nos JSON começam com **“Olá, Laura!”** para roteamento psicológico e triagem.
- **Primário `cta.url`:** mantém destinos externos (HubSpot, vitrines); só produtos cujo primário *é* WhatsApp (ex.: mentoria) usam `wa.me` completo no JSON alinhado à mesma mensagem.
- **Copy:** substituir “Fale pelo WhatsApp” genérico por **“Falar com a Laura”** onde couber; `aria-label` explícito para a11y.

## Conflito com manual Google Doc

- O resumo em `grupo-us/references/manual-resumo.md` foi anotado com o número do site; se o Doc ainda citar +55 11, alinhar stakeholders antes de propagar para outros canais.
