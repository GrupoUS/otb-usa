# Wordmark — origem e derivadas

`otb-logo-gold.png` (360×198, PNG-8) é a **fonte** do wordmark. Ele não é
consumido por nenhum componente: o header e o rodapé servem as derivadas
quantizadas em `public/images/otb/otb-logo-gold-{176,352}.png`.

Por que não passar por `astro:assets`: medido neste arquivo, o pipeline
re-encoda arte chapada e **cresce** — webp 2x = 15,5KB, avif 2x = 17,8KB,
png full-color = 14,5KB, contra 5,6KB do PNG-8 na mesma largura. Formato com
perdas não serve para conteúdo vetorial (`.claude/rules/DESIGN.md § 8`).

Regenerar as derivadas depois de trocar a arte:

```bash
node -e "
const sharp=require('sharp');
(async()=>{ for (const w of [176,352])
  await sharp('src/assets/images/otb/otb-logo-gold.png')
    .resize({width:w})
    .png({palette:true,colors:32,compressionLevel:9,effort:10})
    .toFile('public/images/otb/otb-logo-gold-'+w+'.png');
})();"
```
