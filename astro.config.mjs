// @ts-check

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://otb.gpus.com.br",
	redirects: {
		"/otb": "/",
	},
	fonts: [
		{
			// Display face. Sora (geometric grotesk) replaced Playfair Display when
			// the OTB USA direction moved from editorial-serif to executive
			// geometric: headings are set at 800 with negative tracking, which a
			// high-contrast serif cannot carry at display sizes.
			name: "Sora",
			cssVariable: "--font-sora",
			provider: fontProviders.google(),
			weights: [400, 600, 700, 800],
			styles: ["normal"],
		},
		{
			name: "Inter",
			cssVariable: "--font-inter",
			provider: fontProviders.google(),
			weights: [300, 400, 500, 600, 700],
			styles: ["normal"],
		},
	],
	// No React integration: this landing ships zero islands (no .tsx and no
	// client:* directive anywhere in src). Keeping it only emitted an
	// unreferenced 193KB client bundle and pulled react/react-dom into every
	// install. Add it back together with the first real island.
	integrations: [
		sitemap({
			// Two exclusions, both for the same reason — neither URL is a
			// destination a searcher should land on. `/otb` is the 301 to `/`
			// (indexing both splits the canonical), and `/redirecionando` is the
			// lead hand-off page, which only makes sense with a lead in
			// sessionStorage and carries `noindex` for the same reason.
			// /404 and /500 are dropped by the integration itself; the .txt guard
			// is defensive, in case an endpoint like llms.txt ever shows up in
			// `pages`.
			filter: (page) =>
				!/\/(otb|redirecionando)\/?$/.test(page) && !page.endsWith(".txt"),
			// Build date. The landing is a single page rebuilt on every content
			// change, so "when this was deployed" is the most accurate lastmod
			// available without hand-maintaining a date field.
			lastmod: new Date(),
			// Nothing here is news, image, video or multilingual — without this
			// every urlset carries four dead namespace declarations.
			namespaces: { news: false, xhtml: false, image: false, video: false },
			// vercel.json runs trailingSlash:false + cleanUrls:true, so /foo/
			// answers 308. The sitemap must list the URL that answers 200; only
			// the root keeps its slash.
			serialize(item) {
				if (!item.url) return item;
				const url = new URL(item.url);
				if (url.pathname !== "/" && url.pathname.endsWith("/")) {
					url.pathname = url.pathname.slice(0, -1);
				}
				return { ...item, url: url.href };
			},
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
