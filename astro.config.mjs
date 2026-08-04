// @ts-check

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://otb.drasacha.com.br",
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
	integrations: [
		react(),
		sitemap({
			filter: (page) => !/\/otb\/?$/.test(page),
		}),
	],
	vite: {
		plugins: [tailwindcss()],
	},
});
