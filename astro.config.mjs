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
			filter: (page) => !/\/otb\/?$/.test(page),
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
