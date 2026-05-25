// @ts-check

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, fontProviders } from "astro/config";

// https://astro.build/config
export default defineConfig({
	site: "https://harmonic-pascal.grupous.com.br",
	fonts: [
		{
			name: "Playfair Display",
			cssVariable: "--font-playfair",
			provider: fontProviders.google(),
			weights: [400, 600, 700],
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
	integrations: [react(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
});
