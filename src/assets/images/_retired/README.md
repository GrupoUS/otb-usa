# Fotos retiradas da experiência pública

Estas imagens **não** ficam sob `src/assets/images/otb/**`, que é o glob eager de
`src/lib/images.ts`. Fora dele o Vite não as emite para `dist/_astro/`, ou seja
elas não vão para o CDN nem por URL direta — só estar fora do JSON não bastava.

| Arquivo | Motivo |
|---|---|
| `aula-2.jpg` | Moletom com o wordmark "HARVARD" legível em primeiro plano. Era o plate full-bleed 21:9 da seção Turmas. Também era a pior fonte do acervo (800×500). |
| `pratica-2.jpg` | Mesmo wordmark, também legível. Era o plate full-bleed da seção Boston. |
| `networking-1.jpg` | Retirada a pedido do cliente. |

Contexto das duas primeiras: a issue #1 (`WS-73`) exige a remoção do nome da
experiência pública — o Grupo US aluga o espaço em Boston, o programa não é da
instituição, e qualquer menção implica vínculo que não existe.

Plates atuais: `turma-evento-3.jpg` (Turmas) e `pratica-1.jpg` (Boston).

## Rostos de cadáver

`pratica-1.jpg` tem **dois** rostos de cadáver visíveis (mesa da frente e mesa do
fundo) e ambos foram obscurecidos na própria fonte — pixelização seguida de blur,
com máscara elíptica suave, de modo que o entorno fica intacto. Como o arquivo
serve tanto o plate da seção Boston quanto um tile da galeria, corrigir a fonte
cobre as duas superfícies. As demais mesas da foto estão bloqueadas pelos jalecos.
Ao trocar essa foto, revalidar o mesmo ponto na substituta.

Para descartar de vez: `git rm -r src/assets/images/_retired`. Os blobs seguem
recuperáveis pelo histórico (`git rev-list --all --objects`).
