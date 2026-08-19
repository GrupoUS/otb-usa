/**
 * /llms.txt — the llmstxt.org summary of this product, for assistants that read
 * a site before answering about it.
 *
 * Generated, never hand-written: every number in here (lote price, dates, hours,
 * roster) also renders on the page, and a static copy under `public/` would keep
 * quoting last season's price to every model that reads it, silently, because
 * nothing renders the file. Same single-source rule as the rest of the copy.
 */

import { getEntry } from "astro:content";
import type { APIRoute } from "astro";
import { whatsappUrlWithText } from "../lib/whatsapp";

const SITE = "https://otb.gpus.com.br";

export const GET: APIRoute = async () => {
	const otb = await getEntry("products", "otb");
	if (!otb) {
		throw new Error(
			"Content collection 'products' missing entry 'otb'. Verify src/content/products/otb.json.",
		);
	}

	const { data } = otb;
	const anchor = (hash: string) => `${SITE}/#${hash}`;
	const linhas: string[] = [
		`# ${data.hero.headline} ${data.hero.highlight}`,
		"",
		`> ${data.seo.description}`,
		"",
		data.footer?.resumo ?? data.seo.description,
		"",
		`Página canônica: ${SITE}/ · Idioma: ${data.locale} · Edição: ${data.edicao?.badge ?? `${data.edicao?.numero}ª edição`}.`,
		"Conversão: conversa com a SDR pelo WhatsApp após um formulário curto — não há checkout online.",
		"",
		"## Programa",
		"",
		`- [${data.programa.highlight}](${anchor("programa")}): ${data.programa.descricao}`,
		`- [Trilha de ${data.modulos.lista.length} módulos](${anchor("modulos")}): ${data.modulos.lista
			.map((modulo) => `${modulo.numero} ${modulo.titulo}`)
			.join("; ")}.`,
		"",
		"## Imersão em Boston",
		"",
		`- [${data.boston.datas}](${anchor("boston")}): ${data.boston.descricao}`,
		...(data.agenda ?? []).map(
			(dia) =>
				`- Dia ${dia.dia} — ${dia.data} — ${dia.titulo}: ${dia.atividades.join("; ")}.`,
		),
		"",
		"## Investimento",
		"",
		...(data.lotes ?? []).map(
			(lote) =>
				`- ${lote.label} — ${lote.moeda} ${lote.preco}${lote.validade ? ` — ${lote.validade}` : ""}${lote.nota ? `. ${lote.nota}.` : "."}`,
		),
		`- Parcelamento: ${data.investimento.parcelamento.join("; ")}.`,
		`- Condições completas: ${anchor("investimento")}`,
		"",
		"## Certificações",
		"",
		...(data.credenciais ?? []).map(
			(credencial) =>
				`- ${credencial.nome} (${credencial.categoria}) — ${credencial.emissor}.`,
		),
		"",
		"## Para quem é",
		"",
		`- [Público do programa](${anchor("publico")}): ${data.audience.categorias
			.map((categoria) => categoria.nome)
			.join(", ")}. ${data.audience.legenda}`,
		"",
		"## Corpo docente",
		"",
		...(data.speakers?.lista ?? []).map(
			(speaker) =>
				`- ${speaker.nome} — ${speaker.area}${speaker.instagram ? ` — ${speaker.instagram}` : ""}`,
		),
		"",
		"## Perguntas frequentes",
		"",
		...data.faq.map((item) => `- **${item.pergunta}** ${item.resposta}`),
		"",
		"## Transparência",
		"",
		`> ${data.legal.disclaimer}`,
		"",
		"## Não publicado",
		"",
		"Número de vagas por turma, depoimentos de alunos, resultados financeiros de alunos e a data de ativação do próximo lote não são informados pelo Grupo US — não inferir nem estimar esses dados.",
		"",
		"## Contato",
		"",
		`- [${data.hero.cta.label}](${whatsappUrlWithText(data.hero.cta.whatsappMessage)})`,
		"",
	];

	return new Response(linhas.join("\n"), {
		headers: { "Content-Type": "text/plain; charset=utf-8" },
	});
};
