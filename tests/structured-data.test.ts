/**
 * Post-build assertions on the shipped SEO surface.
 *
 * These read `dist/`, not the source, because every failure they guard against
 * only exists after the build: a price serialised with a pt-BR thousands dot, a
 * graph node referencing an `@id` nobody defines, an image URL that 404s, a
 * compliance claim leaking into `provider`. Run order is the documented gate:
 * `bun run lint && bunx astro check && bun run build && bun test`.
 */
import { describe, expect, it } from "bun:test";
import { existsSync, readFileSync } from "node:fs";

const DIST = new URL("../dist/", import.meta.url).pathname;
const SITE = "https://otb.gpus.com.br";

function readDist(relativePath: string): string {
	const path = `${DIST}${relativePath}`;
	if (!existsSync(path)) {
		throw new Error(
			`dist/${relativePath} not found. Run \`bun run build\` before \`bun test\`.`,
		);
	}
	return readFileSync(path, "utf8");
}

const html = readDist("index.html");
const blocks = [
	...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
].map((match) => match[1]);

type Node = Record<string, unknown>;

const graphRaw = blocks[0]?.replaceAll("\\u003c", "<") ?? "";
const graph = (JSON.parse(graphRaw) as { "@graph": Node[] })["@graph"];

const typesOf = (node: Node): string[] => {
	const type = node["@type"];
	return Array.isArray(type) ? (type as string[]) : [String(type)];
};

const nodeById = new Map(graph.map((node) => [node["@id"] as string, node]));

describe("JSON-LD graph", () => {
	it("ships exactly one block", () => {
		expect(blocks).toHaveLength(1);
	});

	it("gives every node a unique @id", () => {
		const ids = graph.map((node) => node["@id"]).filter(Boolean);
		expect(ids).toHaveLength(new Set(ids).size);
	});

	it("never references an @id it does not define", () => {
		const referenced = [
			...graphRaw.matchAll(/"@id":\s*"(https:\/\/[^"]+#[^"]+)"/g),
		].map((match) => match[1]);
		const dangling = [...new Set(referenced)].filter((id) => !nodeById.has(id));
		expect(dangling).toEqual([]);
	});

	it("publishes the active lote as a machine-readable price", () => {
		const offer = graph.find((node) => typesOf(node).includes("Offer"));
		// "3.500" would be read as three dollars fifty.
		expect(offer?.price).toBe("3500");
		expect(offer?.priceCurrency).toBe("USD");
		// Required by Google's Course info rich result.
		expect(offer?.category).toBe("Paid");
	});

	it("types the immersion with a class schema.org actually defines", () => {
		// "EducationalEvent" reads plausible and is a 404: a typo here silently
		// untypes the headline entity instead of failing anything.
		const event = graph.find((node) =>
			String(node["@id"]).endsWith("#event-boston"),
		);
		expect(typesOf(event as Node)).toEqual(["EducationEvent"]);
	});

	it("keeps CourseInstance-only properties off the Course node", () => {
		const course = graph.find((node) => typesOf(node).includes("Course"));
		// `instructor`, `courseMode` and `courseWorkload` are domain-restricted to
		// CourseInstance; validators flag them on Course.
		expect(course?.instructor).toBeUndefined();
		expect(course?.courseMode).toBeUndefined();
		expect(course?.courseWorkload).toBeUndefined();
	});

	it("carries no rating or review — there is no evidence for either", () => {
		expect(/aggregateRating|"review"|ratingValue/.test(graphRaw)).toBe(false);
	});

	it("declares the FAQ exactly once, on the page entity", () => {
		const faqNodes = graph.filter((node) => typesOf(node).includes("FAQPage"));
		expect(faqNodes).toHaveLength(1);
		expect(typesOf(faqNodes[0]).includes("WebPage")).toBe(true);
	});

	it("names only the real credential issuers", () => {
		const issuers = [
			...graphRaw.matchAll(/"recognizedBy":\{"@type":"Organization","name":"([^"]+)"/g),
		].map((match) => match[1]);
		const foreign = issuers.filter(
			(name) => !/IESA|Grupo US|Anatomy Society of America/.test(name),
		);
		expect(foreign).toEqual([]);
	});

	it("keeps Boston out of every provider and credential slot", () => {
		// The page says in prose that there is no tie to a local institution;
		// the graph must not say otherwise. Boston may appear as a Place name.
		const claimSlots = graph.flatMap((node) =>
			["provider", "publisher", "seller", "organizer", "educationalCredentialAwarded"]
				.map((key) => JSON.stringify(node[key] ?? ""))
				.filter(Boolean),
		);
		const leaking = claimSlots.filter((slot) =>
			/harvard|universit/i.test(slot),
		);
		expect(leaking).toEqual([]);
	});

	it("points every absolute asset URL at a file the build emitted", () => {
		const urls = [
			...graphRaw.matchAll(
				/"(?:url|contentUrl|image|logo)":\s*"(https:\/\/otb\.gpus\.com\.br\/[^"#]+)"/g,
			),
		].map((match) => match[1].replace(SITE, ""));
		const missing = urls.filter(
			(path) => !path.endsWith("/") && !existsSync(`${DIST}${path.slice(1)}`),
		);
		expect(missing).toEqual([]);
	});
});

describe("indexability", () => {
	it("keeps the lead hand-off and the error page out of the index", () => {
		for (const page of ["redirecionando/index.html", "404.html"]) {
			const markup = readDist(page);
			expect(/<meta name="robots" content="noindex, follow">/.test(markup)).toBe(
				true,
			);
			// A canonical on a noindex page is a conflicting signal.
			expect(markup.includes('rel="canonical"')).toBe(false);
		}
	});

	it("asks for full snippets and large previews on the landing", () => {
		expect(
			html.includes(
				'<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">',
			),
		).toBe(true);
	});

	it("lists only the canonical page in the sitemap, with a lastmod", () => {
		const sitemap = readDist("sitemap-0.xml");
		const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
		expect(locs).toEqual([`${SITE}/`]);
		expect(/<lastmod>/.test(sitemap)).toBe(true);
	});

	it("never blocks a crawler it needs to read a noindex", () => {
		const robots = readDist("robots.txt");
		const directives = robots
			.split("\n")
			.filter((line) => line.trim().startsWith("Disallow:"));
		expect(directives).toEqual([]);
		expect(robots.includes("User-agent: GPTBot")).toBe(true);
		expect(robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`)).toBe(true);
	});
});

describe("llms.txt", () => {
	const llms = readDist("llms.txt");

	it("quotes the same active lote the page renders", () => {
		const offer = graph.find((node) => typesOf(node).includes("Offer"));
		expect(llms.includes(`US$ 3.500`)).toBe(true);
		expect(offer?.price).toBe("3500");
	});

	it("carries the institutional disclaimer verbatim", () => {
		expect(
			llms.includes(
				"não possui vínculo, patrocínio, endosso ou certificação por instituições de ensino locais",
			),
		).toBe(true);
	});
});
