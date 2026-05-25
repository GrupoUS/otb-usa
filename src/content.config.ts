import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const ctaSchema = z.object({
	label: z.string().min(2),
	whatsappMessage: z.string().refine((m) => m.startsWith("Olá, Laura!"), {
		message: "WhatsApp message must start with 'Olá, Laura!' (SDR SSOT).",
	}),
	checkoutUrl: z.string().url().nullable().optional(),
	secondaryLabel: z.string().optional(),
});

const products = defineCollection({
	loader: glob({ pattern: "**/*.json", base: "./src/content/products" }),
	schema: z.object({
		slug: z.string(),
		version: z.string(),
		locale: z.literal("pt-BR"),

		seo: z.object({
			title: z.string().min(20).max(70),
			description: z.string().min(120).max(220),
			ogImage: z.string(),
			canonical: z.string().url().optional(),
		}),

		hero: z.object({
			eyebrow: z.string().optional(),
			headline: z.string(),
			highlight: z.string().optional(),
			subheadline: z.string(),
			badges: z.array(z.string()).min(2).max(6),
			cta: ctaSchema,
			background: z.object({
				image: z.string(),
				alt: z.string(),
			}),
		}),

		why: z.object({
			headline: z.string(),
			highlight: z.string().optional(),
			cards: z
				.array(
					z.object({
						titulo: z.string(),
						descricao: z.string(),
					}),
				)
				.length(3),
		}),

		audience: z.object({
			headline: z.string(),
			quote: z.string(),
			categorias: z
				.array(
					z.object({
						nome: z.string(),
						icone: z.string(),
					}),
				)
				.min(4),
			legenda: z.string(),
			background: z.object({
				image: z.string(),
				alt: z.string(),
			}),
		}),

		programa: z.object({
			headline: z.string(),
			highlight: z.string().optional(),
			descricao: z.string(),
			horas: z.number().int().positive(),
			cards: z
				.array(
					z.object({
						titulo: z.string(),
						descricao: z.string(),
					}),
				)
				.length(3),
		}),

		turmas: z.object({
			headline: z.string(),
			descricao: z.string(),
			fotos: z.array(
				z.object({
					src: z.string(),
					alt: z.string(),
				}),
			),
		}),

		modulos: z.object({
			headline: z.string(),
			highlight: z.string().optional(),
			descricao: z.string(),
			lista: z
				.array(
					z.object({
						numero: z.string(),
						titulo: z.string(),
						subtitulo: z.string().optional(),
					}),
				)
				.length(10),
		}),

		bostonHarvard: z.object({
			headline: z.string(),
			highlight: z.string().optional(),
			descricao: z.string(),
			datas: z.string(),
			cards: z
				.array(
					z.object({
						titulo: z.string(),
						descricao: z.string(),
					}),
				)
				.length(3),
			background: z.object({
				image: z.string(),
				alt: z.string(),
			}),
		}),

		speakers: z.object({
			headline: z.string(),
			highlight: z.string().optional(),
			descricao: z.string(),
			lista: z
				.array(
					z.object({
						nome: z.string(),
						area: z.string(),
						bio: z.string().max(280),
						instagram: z.string().url(),
						foto: z.string(),
					}),
				)
				.min(3),
		}),

		investimento: z.object({
			headline: z.string(),
			highlight: z.string().optional(),
			descricao: z.string(),
			moeda: z.string(),
			preco: z.string(),
			escassez: z.string().optional(),
			parcelamento: z.array(z.string()),
			beneficios: z.array(z.string()).min(3),
			tagline: z.string(),
			cta: ctaSchema,
		}),

		faq: z
			.array(
				z.object({
					pergunta: z.string(),
					resposta: z.string(),
				}),
			)
			.min(4),

		edicao: z
			.object({
				numero: z.number().int().positive(),
				ano: z.number().int().positive(),
				local: z.string(),
				badge: z.string().optional(),
			})
			.optional(),

		lotes: z
			.array(
				z.object({
					id: z.string(),
					label: z.string(),
					moeda: z.string(),
					preco: z.string(),
					validade: z.string().optional(),
					status: z.enum(["encerrado", "ativo", "futuro"]),
					nota: z.string().optional(),
				}),
			)
			.optional(),

		agenda: z
			.array(
				z.object({
					dia: z.number().int().positive(),
					data: z.string(),
					titulo: z.string(),
					descricao: z.string(),
					atividades: z.array(z.string()).min(1),
				}),
			)
			.length(3)
			.optional(),

		parceiros: z
			.object({
				headline: z.string(),
				descricao: z.string().optional(),
				lista: z
					.array(
						z.object({
							nome: z.string(),
							papel: z.string(),
							descricao: z.string().optional(),
							contato: z
								.object({
									whatsapp: z.string().optional(),
									instagram: z.string().url().optional(),
									email: z.string().email().optional(),
								})
								.optional(),
						}),
					)
					.min(1),
			})
			.optional(),

		legal: z.object({
			disclaimer: z.string().min(80),
			creditosImagens: z.string().optional(),
		}),
	}),
});

export const collections = { products };
