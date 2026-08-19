import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const ctaSchema = z.object({
	label: z.string().min(2),
	whatsappMessage: z.string().refine((m) => m.startsWith("Olá, Laura!"), {
		message: "WhatsApp message must start with 'Olá, Laura!' (SDR SSOT).",
	}),
	checkoutUrl: z.url().nullable().optional(),
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
			canonical: z.url().optional(),
		}),

		header: z
			.object({
				marca: z.string(),
				edicaoChip: z.string(),
				nav: z
					.array(
						z.object({
							label: z.string(),
							href: z.string().startsWith("#"),
						}),
					)
					.min(2)
					.max(5),
				ctaLabel: z.string(),
			})
			.optional(),

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
			facts: z
				.array(
					z.object({
						rotulo: z.string(),
						valor: z.string(),
						icone: z.string(),
					}),
				)
				.min(3)
				.max(4)
				.optional(),
		}),

		/** Crimson credential ribbon between hero and why. Claims only —
		 *  never marketing copy; each entry is verifiable in legal.disclaimer. */
		certificacoes: z.array(z.string().min(8).max(60)).length(4).optional(),

		/** Labels for the ribbon's pause control. The runtime refuses to animate a
		 *  marquee without them: moving text that cannot be stopped fails
		 *  WCAG 2.2.2, and hover is not a mechanism for keyboard or touch. */
		certificacoesControles: z
			.object({
				pausar: z.string().min(10),
				retomar: z.string().min(10),
			})
			.optional(),

		why: z.object({
			positioningQuote: z.string().min(60).max(220).optional(),
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
			personaIntro: z.string().min(80).max(320).optional(),
			personaBullets: z
				.array(z.string().min(40).max(240))
				.min(3)
				.max(6)
				.optional(),
			categorias: z
				.array(
					z.object({
						nome: z.string(),
						icone: z.string(),
					}),
				)
				.min(4),
			legenda: z.string(),
		}),

		programa: z.object({
			headline: z.string(),
			highlight: z.string().optional(),
			descricao: z.string(),
			narrativa: z.string().min(80).max(320).optional(),
			horas: z.number().int().positive(),
			kpis: z
				.array(
					z.object({
						valor: z.number().int().positive(),
						sufixo: z.string().max(4).optional(),
						rotulo: z.string().min(4).max(40),
					}),
				)
				.min(3)
				.max(4)
				.optional(),
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

		boston: z.object({
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
			freshStats: z
				.array(
					z.object({
						valor: z.string().min(2).max(12),
						rotulo: z.string().min(10).max(80),
					}),
				)
				.length(3)
				.optional(),
			background: z.object({
				image: z.string(),
				alt: z.string(),
			}),
			/** Fourth panel of the pinned rail: what the three days leave behind,
			 *  plus the consultative CTA. Optional so the rail degrades to the
			 *  three agenda days when it is absent. */
			ctaCard: z
				.object({
					kicker: z.string(),
					texto: z.string().min(40),
					cta: ctaSchema,
				})
				.optional(),
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
						/** Optional: the card drops the link rather than carry an
						 *  invented handle for a real person. */
						instagram: z.url().optional(),
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

		faqIntro: z
			.object({
				kicker: z.string(),
				headline: z.string(),
			})
			.optional(),

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
				/** Machine-readable end of the immersion, for `Event.endDate`. The
				 *  START is not repeated here on purpose — `countdown.target` is
				 *  already that instant, with the Boston offset, and a second copy
				 *  would drift. Calendar date, not an instant: the SSOT has no
				 *  closing time for day three and inventing one is a fabricated
				 *  fact. */
				fim: z.iso.date().optional(),
				endereco: z
					.object({
						localidade: z.string(),
						regiao: z.string(),
						pais: z.string().length(2),
					})
					.optional(),
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
					/** ISO form of `validade`, for `Offer.validFrom`. Only the active
					 *  lote is published as an offer, so only it needs this. */
					validoDe: z.iso.date().optional(),
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
									instagram: z.url().optional(),
									email: z.email().optional(),
								})
								.optional(),
						}),
					)
					.min(1),
			})
			.optional(),

		finalCta: z
			.object({
				kicker: z.string(),
				headline: z.string(),
				descricao: z.string().optional(),
				cta: ctaSchema,
			})
			.optional(),

		footer: z
			.object({
				resumo: z.string().min(40),
				sede: z.string(),
				navTitulo: z.string(),
				nav: z
					.array(
						z.object({
							label: z.string(),
							href: z.string().startsWith("#"),
						}),
					)
					.min(4),
				contatoTitulo: z.string(),
				contatoTexto: z.string(),
				contatoLabel: z.string(),
			})
			.optional(),

		leadForm: z.object({
			eyebrow: z.string(),
			title: z.string(),
			description: z.string(),
			closeLabel: z.string(),
			requiredHint: z.string(),
			fields: z.object({
				name: z.object({
					label: z.string(),
					placeholder: z.string(),
					help: z.string(),
				}),
				email: z.object({
					label: z.string(),
					placeholder: z.string(),
					help: z.string(),
				}),
				whatsapp: z.object({
					label: z.string(),
					placeholder: z.string(),
					help: z.string(),
				}),
			}),
			consent: z.object({
				prefix: z.string(),
				linkLabel: z.string(),
				suffix: z.string(),
				privacyUrl: z.url(),
			}),
			submitLabel: z.string(),
			pendingLabel: z.string(),
			validationError: z.string(),
			genericError: z.string(),
			version: z.literal("otb-lead-v1"),
		}),

		/** Section 01 — the tension that precedes the offer. Narrative only:
		 *  no claim, no number, nothing that needs verification. */
		virada: z
			.object({
				kicker: z.string(),
				headline: z.string(),
				highlight: z.string(),
				paragrafo: z.string().min(80),
				quote: z.string().min(60),
				listaTitulo: z.string(),
				lista: z
					.array(
						z.object({
							titulo: z.string(),
							descricao: z.string(),
						}),
					)
					.length(4),
				background: z.object({
					image: z.string(),
					alt: z.string(),
				}),
			})
			.optional(),

		/** Inline application section. Reuses `leadForm` for the field copy the
		 *  two surfaces share; only what is specific to this section lives here.
		 *  `profissoes` / `momentos` are qualification answers: they travel in the
		 *  WhatsApp message, never in the lead payload. */
		aplicacao: z
			.object({
				kicker: z.string(),
				headline: z.string(),
				highlight: z.string(),
				descricao: z.string().min(60),
				passos: z.array(z.string().min(20)).length(3),
				formTitulo: z.string(),
				/** Own hint: unlike the modal, this form treats the e-mail as
				 *  optional, so `leadForm.requiredHint` would be a lie here. */
				requiredHint: z.string(),
				profissaoLabel: z.string(),
				profissaoPlaceholder: z.string(),
				profissoes: z.array(z.string()).min(3).max(10),
				momentoLabel: z.string(),
				momentoPlaceholder: z.string(),
				momentos: z.array(z.string()).min(3).max(6),
				submitLabel: z.string(),
				microcopy: z.string().min(40),
				/** Shown inside <noscript>: without JS the form is not rendered at
				 *  all, so this is the only thing that stands in for it. */
				semJs: z.string().min(40),
				whatsappPrefacio: z
					.string()
					.refine((m) => m.startsWith("Olá, Laura!"), {
						message:
							"WhatsApp message must start with 'Olá, Laura!' (SDR SSOT).",
					}),
				sucesso: z.object({
					titulo: z.string(),
					texto: z.string().min(40),
					ctaLabel: z.string(),
					resetLabel: z.string(),
				}),
			})
			.optional(),

		/** Disclosure bar. Every line here is a compliance statement — edit it
		 *  with the same care as `legal.disclaimer`. */
		transparencia: z
			.array(
				z.object({
					icone: z.string(),
					titulo: z.string(),
					texto: z.string().min(40),
				}),
			)
			.length(3)
			.optional(),

		/** Live countdown to the immersion. `target` is an ISO instant WITH the
		 *  Boston offset — the page is read from Brazil, so a bare date would be
		 *  off by an hour twice a year. The only sanctioned urgency device
		 *  alongside the active lote (PRODUCT.md § urgency). */
		countdown: z
			.object({
				target: z.iso.datetime({ offset: true }),
				heroKicker: z.string(),
				investimentoKicker: z.string(),
				stickyPrefixo: z.string(),
				unidades: z.object({
					dias: z.string(),
					horas: z.string(),
					minutos: z.string(),
					segundos: z.string(),
				}),
				ariaLabel: z.string(),
			})
			.optional(),

		/** `Course.educationalCredentialAwarded`. Explicit rather than derived
		 *  from `certificacoes`: that strip mixes credentials with descriptive
		 *  claims ("10 módulos · 320 horas"), and a positional slice would publish
		 *  the wrong one the day someone reorders the marquee for design reasons.
		 *  Guardrail: `emissor` may only name Instituto IESA, Grupo US and the
		 *  Anatomy Society of America. */
		credenciais: z
			.array(
				z.object({
					nome: z.string().min(4),
					categoria: z.string().min(3),
					emissor: z.string().min(3),
				}),
			)
			.min(1)
			.max(4)
			.optional(),

		/** Copy for the 404 route. Lives here for the same reason every other
		 *  string does: the page must not author product copy. */
		erro404: z
			.object({
				eyebrow: z.string(),
				titulo: z.string(),
				descricao: z.string(),
				ctaLabel: z.string(),
				whatsappLabel: z.string(),
				whatsappMessage: z.string().refine((m) => m.startsWith("Olá, Laura!"), {
					message: "WhatsApp message must start with 'Olá, Laura!' (SDR SSOT).",
				}),
			})
			.optional(),

		legal: z.object({
			disclaimer: z.string().min(80),
			creditosImagens: z.string().optional(),
		}),
	}),
});

export const collections = { products };
