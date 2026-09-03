/**
 * Schema.org graph for the landing.
 *
 * One `@graph` per page, nodes wired by absolute `@id`. Everything is composed
 * from the content collection — no product copy is authored here. Two hard
 * limits, both from PRODUCT.md § Guardrails:
 *
 *   1. Boston appears only as a `Place`. No American institution is named as
 *      provider, sponsor or credential issuer. The only issuers are the ones
 *      spelled out in `credenciais` (Instituto IESA / Grupo US and the Anatomy
 *      Society of America).
 *   2. No `aggregateRating`, no `review`, no seat count. There is no evidence on
 *      hand for any of the three.
 */
import { getImage } from "astro:assets";
import type { CollectionEntry } from "astro:content";
import { resolveImage } from "./images";

type ProductData = CollectionEntry<"products">["data"];

export type JsonLdNode = Record<string, unknown>;

export interface GraphContext {
	/** Canonical origin, no trailing slash. */
	site: string;
	/** Absolute URL of the page the graph describes. */
	pageUrl: string;
}

const CURRENCY_BY_SYMBOL: Record<string, string> = {
	US$: "USD",
	R$: "BRL",
};

/** "US$" → "USD". Throws rather than guessing: a wrong currency publishes a
 *  wrong price. */
export function currencyCode(symbol: string): string {
	const code = CURRENCY_BY_SYMBOL[symbol.trim()];
	if (!code) {
		throw new Error(
			`Unknown currency symbol "${symbol}". Add it to CURRENCY_BY_SYMBOL in src/lib/structured-data.ts.`,
		);
	}
	return code;
}

/** "3.500" → "3500". pt-BR punctuation: dot groups thousands, comma is the
 *  decimal separator. Serialising "3.500" would be read as three dollars fifty. */
export function priceValue(preco: string): string {
	const parsed = Number(preco.replace(/\./g, "").replace(",", "."));
	if (!Number.isFinite(parsed) || parsed <= 0) {
		throw new Error(
			`Invalid price "${preco}" in otb.json lotes[]/investimento.`,
		);
	}
	return String(parsed);
}

/** "Lote 1 — Ativo" → "Lote 1". Same rule index.astro uses for the sticky bar. */
export function loteLabelCurto(label: string): string {
	return label.replace(/\s*—\s*Ativo$/i, "");
}

export function slugify(value: string): string {
	return value
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/** Day N of the immersion as a calendar date derived from the start instant.
 *  Date-only on purpose: only day one has a known start time. */
function dayDate(startIso: string, dayIndex: number): string {
	const [datePart] = startIso.split("T");
	const [year, month, day] = datePart.split("-").map(Number);
	return new Date(Date.UTC(year, month - 1, day + dayIndex))
		.toISOString()
		.slice(0, 10);
}

export async function buildLandingGraph(
	data: ProductData,
	{ site, pageUrl }: GraphContext,
): Promise<JsonLdNode[]> {
	const id = (fragment: string) => `${pageUrl}#${fragment}`;
	const ref = (fragment: string) => ({ "@id": id(fragment) });
	const organizationRef = { "@id": `${site}/#organization` };

	/* The OG plate is the one page image with a stable public URL and known
	   intrinsic size. Gallery and portrait paths in the JSON are content-layer
	   paths that only exist as hashed derivatives — pointing the graph at them
	   would emit 404s. */
	const primaryImage: JsonLdNode = {
		"@type": "ImageObject",
		"@id": id("primaryimage"),
		url: `${site}${data.seo.ogImage}`,
		contentUrl: `${site}${data.seo.ogImage}`,
		width: 1200,
		height: 630,
	};

	/* Portraits go through the same pipeline as the <Picture> in Speakers.astro
	   (same width, format and quality), so the graph references a file the build
	   already emits instead of adding a variant — or worse, a 404. */
	const speakers: JsonLdNode[] = await Promise.all(
		(data.speakers?.lista ?? []).map(async (speaker) => {
			const portrait = await getImage({
				src: resolveImage(speaker.foto),
				width: 640,
				format: "jpeg",
				quality: 68,
			});

			return {
				"@type": "Person",
				"@id": id(`person-${slugify(speaker.nome)}`),
				name: speaker.nome,
				jobTitle: speaker.area,
				description: speaker.bio,
				image: `${site}${portrait.src}`,
				...(speaker.instagram ? { sameAs: [speaker.instagram] } : {}),
			};
		}),
	);

	const speakerRefs = speakers.map((speaker) => ({ "@id": speaker["@id"] }));

	const loteAtivo = data.lotes?.find((lote) => lote.status === "ativo");

	/* Only the active lote becomes an Offer. Closed lots and the unreleased
	   next lote ("liberação por volume ou data") must not be published as
	   purchasable prices. Hence a single Offer and never an AggregateOffer. */
	const offer: JsonLdNode | undefined = loteAtivo
		? {
				"@type": "Offer",
				"@id": id("offer-lote-ativo"),
				name: loteLabelCurto(loteAtivo.label),
				price: priceValue(loteAtivo.preco),
				priceCurrency: currencyCode(loteAtivo.moeda),
				// Google's Course info enum: Free | Partially Free | Subscription | Paid
				category: "Paid",
				availability: "https://schema.org/InStock",
				url: `${pageUrl}#investimento`,
				seller: organizationRef,
				...(loteAtivo.validoDe ? { validFrom: loteAtivo.validoDe } : {}),
			}
		: undefined;

	const place: JsonLdNode | undefined = data.edicao?.endereco
		? {
				"@type": "Place",
				"@id": id("place-boston"),
				name: data.edicao.local,
				address: {
					"@type": "PostalAddress",
					addressLocality: data.edicao.endereco.localidade,
					addressRegion: data.edicao.endereco.regiao,
					addressCountry: data.edicao.endereco.pais,
				},
			}
		: undefined;

	const startDate = data.countdown?.target;
	const endDate = data.edicao?.fim;
	const hasSchedule = Boolean(startDate && endDate && place);

	/* One Event per day of the immersion. No rich result rides on these, but
	   they are the machine-readable answer to "what happens on each day" — the
	   question an assistant gets asked. Date-only for the reason in `dayDate`. */
	const subEvents: JsonLdNode[] =
		hasSchedule && data.agenda && startDate
			? data.agenda.map((dia) => ({
					"@type": "Event",
					"@id": id(`agenda-dia-${dia.dia}`),
					name: dia.titulo,
					description: dia.descricao,
					startDate: dayDate(startDate, dia.dia - 1),
					eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
					eventStatus: "https://schema.org/EventScheduled",
					organizer: organizationRef,
					superEvent: ref("event-boston"),
					...(place ? { location: ref("place-boston") } : {}),
				}))
			: [];

	/* The immersion is its own Event rather than a mode on the course instance:
	   the programme as a whole is `blended` (10 online modules + 3 days), while
	   these three days are strictly offline. One node cannot be both. */
	const bostonEvent: JsonLdNode | undefined = hasSchedule
		? {
				// EducationEvent, not "EducationalEvent" — the latter is not a
				// schema.org class (schema.org/EducationalEvent is a 404), so the node
				// would carry an undefined type and stop being read as an Event at all.
				"@type": "EducationEvent",
				"@id": id("event-boston"),
				name: data.seo.title,
				description: data.boston.descricao,
				url: pageUrl,
				image: ref("primaryimage"),
				startDate,
				endDate,
				eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
				eventStatus: "https://schema.org/EventScheduled",
				inLanguage: data.locale,
				organizer: organizationRef,
				superEvent: ref("courseinstance"),
				...(place ? { location: ref("place-boston") } : {}),
				...(speakerRefs.length ? { performer: speakerRefs } : {}),
				...(offer ? { offers: ref("offer-lote-ativo") } : {}),
				...(subEvents.length
					? { subEvent: subEvents.map((event) => ({ "@id": event["@id"] })) }
					: {}),
			}
		: undefined;

	const courseInstance: JsonLdNode = {
		"@type": "CourseInstance",
		"@id": id("courseinstance"),
		name: data.edicao?.badge
			? `${data.header?.marca ?? "OTB"} — ${data.edicao.badge}`
			: data.seo.title,
		// Both required by Google's Course info: mode plus workload (or schedule).
		courseMode: "blended",
		courseWorkload: `PT${data.programa.horas}H`,
		inLanguage: data.locale,
		organizer: organizationRef,
		...(place ? { location: ref("place-boston") } : {}),
		...(speakerRefs.length ? { instructor: speakerRefs } : {}),
		...(offer ? { offers: ref("offer-lote-ativo") } : {}),
		...(bostonEvent ? { subEvent: ref("event-boston") } : {}),
	};

	const course: JsonLdNode = {
		"@type": "Course",
		"@id": id("course"),
		name: `${data.hero.headline} ${data.hero.highlight}`.trim(),
		description: data.seo.description,
		url: pageUrl,
		image: ref("primaryimage"),
		inLanguage: data.locale,
		provider: organizationRef,
		timeRequired: `PT${data.programa.horas}H`,
		teaches: data.modulos.lista.map((modulo) => modulo.titulo),
		syllabusSections: data.modulos.lista.map((modulo) => ({
			"@type": "Syllabus",
			position: Number(modulo.numero),
			name: modulo.titulo,
			description: modulo.subtitulo,
		})),
		hasCourseInstance: ref("courseinstance"),
		// `instructor` is domain-restricted to CourseInstance; on Course it is an
		// out-of-domain property that validators flag. The roster rides on the
		// instance and on the event instead.
		...(data.audience?.legenda
			? { coursePrerequisites: data.audience.legenda }
			: {}),
		...(data.credenciais?.length
			? {
					educationalCredentialAwarded: data.credenciais.map((credencial) => ({
						"@type": "EducationalOccupationalCredential",
						name: credencial.nome,
						credentialCategory: credencial.categoria,
						recognizedBy: { "@type": "Organization", name: credencial.emissor },
					})),
				}
			: {}),
		...(offer ? { offers: ref("offer-lote-ativo") } : {}),
		...(data.audience?.categorias?.length
			? {
					audience: {
						"@type": "EducationalAudience",
						educationalRole: "professional",
						audienceType: data.audience.categorias.map(
							(categoria) => categoria.nome,
						),
					},
				}
			: {}),
	};

	const website: JsonLdNode = {
		"@type": "WebSite",
		"@id": `${site}/#website`,
		url: `${site}/`,
		name: data.seo.title,
		description: data.seo.description,
		inLanguage: data.locale,
		publisher: organizationRef,
	};

	/* WebPage doubles as the FAQPage: the answers describe this page, so they
	   belong to its entity instead of a second, disconnected graph in the body. */
	const webpage: JsonLdNode = {
		"@type": ["WebPage", "FAQPage"],
		"@id": id("webpage"),
		url: pageUrl,
		name: data.seo.title,
		description: data.seo.description,
		inLanguage: data.locale,
		isPartOf: { "@id": `${site}/#website` },
		about: ref("course"),
		primaryImageOfPage: ref("primaryimage"),
		breadcrumb: ref("breadcrumb"),
		mainEntity: data.faq.map((item) => ({
			"@type": "Question",
			name: item.pergunta,
			acceptedAnswer: { "@type": "Answer", text: item.resposta },
		})),
	};

	const breadcrumb: JsonLdNode = {
		"@type": "BreadcrumbList",
		"@id": id("breadcrumb"),
		itemListElement: [
			{ "@type": "ListItem", position: 1, name: "Início", item: pageUrl },
			// Last crumb is the current page, so it carries no `item` — an anchor
			// is not a separate page and Google reads it as a duplicate entry.
			{ "@type": "ListItem", position: 2, name: data.hero.highlight },
		],
	};

	return [
		website,
		webpage,
		breadcrumb,
		primaryImage,
		course,
		courseInstance,
		...(bostonEvent ? [bostonEvent] : []),
		...subEvents,
		...(place ? [place] : []),
		...(offer ? [offer] : []),
		...speakers,
	];
}
