export const LEAD_CTA_ORIGINS = [
	"header_desktop",
	"hero",
	"investimento",
	"cta_final",
	"footer",
	"flutuante_desktop",
	"sticky_mobile",
] as const;

export type LeadCtaOrigin = (typeof LEAD_CTA_ORIGINS)[number];

export const LEAD_CONSENT_VERSION = "otb-lead-v1" as const;
export const LEAD_CANONICAL_PAGE = "/" as const;
export const LEAD_BODY_MAX_BYTES = 16_384;
export const LEAD_MIN_FILL_MS = 1_500;
export const LEAD_UPSTREAM_TIMEOUT_MS = 20_000;

export const LEAD_SHEET_HEADERS = [
	"lead_id",
	"recebido_em_utc",
	"nome_completo",
	"email",
	"whatsapp",
	"cta_origem",
	"pagina",
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_content",
	"utm_term",
	"consentimento",
	"consentido_em_utc",
	"consentimento_versao",
] as const;

const CLIENT_KEYS = [
	"lead_id",
	"nome_completo",
	"email",
	"whatsapp",
	"cta_origem",
	"pagina",
	"utm_source",
	"utm_medium",
	"utm_campaign",
	"utm_content",
	"utm_term",
	"consentimento",
	"consentimento_versao",
	"empresa",
	"form_started_at",
] as const;

const UUID_V4_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_INPUT_PATTERN = /^[\d\s()+.-]+$/;
const CTA_ORIGIN_SET = new Set<string>(LEAD_CTA_ORIGINS);

export interface LeadSubmission {
	lead_id: string;
	nome_completo: string;
	email: string;
	whatsapp: string;
	cta_origem: LeadCtaOrigin;
	pagina: typeof LEAD_CANONICAL_PAGE;
	utm_source: string;
	utm_medium: string;
	utm_campaign: string;
	utm_content: string;
	utm_term: string;
	consentimento: true;
	consentimento_versao: typeof LEAD_CONSENT_VERSION;
	empresa: string;
	form_started_at: number;
}

export type LeadSheetRow = Record<(typeof LEAD_SHEET_HEADERS)[number], string>;

export type LeadValidationResult =
	| { ok: true; row: LeadSheetRow }
	| { ok: false };

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactClientKeys(value: Record<string, unknown>): boolean {
	const keys = Object.keys(value).sort();
	const expected = [...CLIENT_KEYS].sort();
	return (
		keys.length === expected.length &&
		keys.every((key, index) => key === expected[index])
	);
}

function stripControlCharacters(value: string): string {
	let sanitized = "";
	for (const character of value) {
		const codePoint = character.codePointAt(0) ?? 0;
		sanitized += codePoint <= 0x1f || codePoint === 0x7f ? " " : character;
	}
	return sanitized;
}

function normalizedString(value: unknown, maxLength: number): string | null {
	if (typeof value !== "string") return null;
	const normalized = stripControlCharacters(value).replace(/\s+/g, " ").trim();
	if (normalized.length > maxLength) return null;
	return normalized;
}

export function normalizeLeadName(value: unknown): string | null {
	const name = normalizedString(value, 120);
	if (!name || name.length < 3 || name.split(" ").length < 2) return null;
	return name;
}

function normalizeEmail(value: unknown): string | null {
	const email = normalizedString(value, 254)?.toLowerCase() ?? null;
	if (!email || !EMAIL_PATTERN.test(email)) return null;
	return email;
}

export function normalizeLeadPhone(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const input = value.trim();
	if (!input || input.length > 32 || !PHONE_INPUT_PATTERN.test(input))
		return null;

	const digits = input.replace(/\D/g, "");
	if (input.startsWith("+")) {
		return digits.length >= 10 && digits.length <= 15 ? `+${digits}` : null;
	}
	if (/^55\d{10,11}$/.test(digits)) return `+${digits}`;
	if (/^\d{10,11}$/.test(digits)) return `+55${digits}`;
	return digits.length >= 12 && digits.length <= 15 ? `+${digits}` : null;
}

function normalizeUtm(value: unknown): string | null {
	return normalizedString(value, 100);
}

export function validateLeadSubmission(
	value: unknown,
	nowMs: number,
): LeadValidationResult {
	if (!isRecord(value) || !hasExactClientKeys(value)) return { ok: false };
	if (!Number.isFinite(nowMs)) return { ok: false };

	const leadId = typeof value.lead_id === "string" ? value.lead_id : "";
	const name = normalizeLeadName(value.nome_completo);
	const email = normalizeEmail(value.email);
	const whatsapp = normalizeLeadPhone(value.whatsapp);
	const ctaOrigin =
		typeof value.cta_origem === "string" && CTA_ORIGIN_SET.has(value.cta_origem)
			? (value.cta_origem as LeadCtaOrigin)
			: null;
	const utmSource = normalizeUtm(value.utm_source);
	const utmMedium = normalizeUtm(value.utm_medium);
	const utmCampaign = normalizeUtm(value.utm_campaign);
	const utmContent = normalizeUtm(value.utm_content);
	const utmTerm = normalizeUtm(value.utm_term);
	const honeypot = normalizedString(value.empresa, 200);
	const startedAt = value.form_started_at;

	if (
		!UUID_V4_PATTERN.test(leadId) ||
		!name ||
		!email ||
		!whatsapp ||
		!ctaOrigin ||
		value.pagina !== LEAD_CANONICAL_PAGE ||
		utmSource === null ||
		utmMedium === null ||
		utmCampaign === null ||
		utmContent === null ||
		utmTerm === null ||
		value.consentimento !== true ||
		value.consentimento_versao !== LEAD_CONSENT_VERSION ||
		honeypot !== "" ||
		typeof startedAt !== "number" ||
		!Number.isInteger(startedAt) ||
		nowMs - startedAt < LEAD_MIN_FILL_MS
	) {
		return { ok: false };
	}

	const timestamp = new Date(nowMs).toISOString();
	return {
		ok: true,
		row: {
			lead_id: leadId,
			recebido_em_utc: timestamp,
			nome_completo: name,
			email,
			whatsapp,
			cta_origem: ctaOrigin,
			pagina: LEAD_CANONICAL_PAGE,
			utm_source: utmSource,
			utm_medium: utmMedium,
			utm_campaign: utmCampaign,
			utm_content: utmContent,
			utm_term: utmTerm,
			consentimento: "SIM",
			consentido_em_utc: timestamp,
			consentimento_versao: LEAD_CONSENT_VERSION,
		},
	};
}
