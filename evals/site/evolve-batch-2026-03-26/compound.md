# Compound — lote 10× evolve (copy, SEO, CTA, fricção)

Runs agregados: `runs/2026-03-26-10x-loop/run.md`.

## Padrões a reutilizar

| Loop | Insight |
|------|---------|
| 1 | Grid da home: subtítulo explica **destino real** do clique (externo vs interno); CTA do card “Ver programa” > “Saiba mais”. **Sem** `fetch` de debug em componentes de produção. |
| 2 | CTA final: pergunta por **momento** + promessa de **trilha** reduz ansiedade de escolha; botões com verbo claro (WhatsApp / formulário). |
| 3 | Sobre na home: evitar claim absoluto (“mais completo”); substituir por **números + trilhas** e visão verificável. |
| 4 | Bloco de estatísticas: `h2` `sr-only` liga números a **heading** para SEO/a11y sem mudar layout. |
| 5–6 | Páginas institucionais: title com **pipe** e intenção; description com **serviço + público + ação**. |
| 7 | Rodapé alinhado ao default do `Layout` evita narrativa divergente marca vs página. |
| 8–10 | Campo `description` nos JSON de produto = **meta** das landings que usam `description={d.description}` — incluir MEC/público/resultado quando couber em ~155–165 caracteres. |
| 10b | 404: meta e corpo guiam para **home/programas** e contato, não só “não existe”. |

## Backlog

- Replicar padrão de meta enriquecida nas demais páginas de produto quando existirem rotas `.astro`.
- `title` custom por produto (ex.: keyword antes do nome) exigiria campo opcional no schema ou convenção no template.
