/**
 * Browser-side half of the lead flow, shared by every capture surface.
 *
 * Two surfaces submit leads today — the modal (`LeadFormDialog.astro`) and the
 * inline application section (`Aplicacao.astro`) — and they must agree on the
 * lead id, the draft key, the payload shape and the hand-off contract read by
 * `/redirecionando`. Anything both of them need lives here; anything specific
 * to one of them stays in its component.
 *
 * The payload shape is validated server-side by `validateLeadSubmission`, which
 * rejects unknown keys outright: never add a field here without adding it there
 * (and to the sheet headers) in the same change.
 */
import { LEAD_CANONICAL_PAGE, normalizeLeadName } from "./leads";

export function isCompleteLeadName(value: string): boolean {
	return normalizeLeadName(value) !== null;
}

export interface SubmissionGate {
	tryStart(): boolean;
	finish(): void;
	isPending(): boolean;
}

export function createSubmissionGate(): SubmissionGate {
	let pending = false;
	return {
		tryStart() {
			if (pending) return false;
			pending = true;
			return true;
		},
		finish() {
			pending = false;
		},
		isPending() {
			return pending;
		},
	};
}

/** Hand-off payload read — and immediately erased — by `/redirecionando`. */
export const LEAD_HANDOFF_KEY = "otb_lead";
export const LEAD_CLIENT_TIMEOUT_MS = 25_000;

const UUID_V4_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface LeadDraft {
	leadId: string;
	startedAt: number;
	name: string;
	email: string;
	whatsapp: string;
}

export function createLeadId(): string {
	if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
	const bytes = crypto.getRandomValues(new Uint8Array(16));
	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;
	const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
	return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

export function readLeadDraft(key: string): LeadDraft | null {
	try {
		const raw = sessionStorage.getItem(key);
		if (!raw) return null;
		const value = JSON.parse(raw) as Partial<LeadDraft>;
		if (
			typeof value.leadId !== "string" ||
			!UUID_V4_PATTERN.test(value.leadId) ||
			typeof value.startedAt !== "number" ||
			!Number.isInteger(value.startedAt) ||
			typeof value.name !== "string" ||
			typeof value.email !== "string" ||
			typeof value.whatsapp !== "string"
		) {
			return null;
		}
		return value as LeadDraft;
	} catch {
		return null;
	}
}

export function writeLeadDraft(key: string, draft: LeadDraft): void {
	try {
		sessionStorage.setItem(key, JSON.stringify(draft));
	} catch {
		// A blocked storage API must not break the form.
	}
}

export function clearLeadDraft(key: string): void {
	try {
		sessionStorage.removeItem(key);
	} catch {
		// Success is already acknowledged; navigation may proceed.
	}
}

/** UTM parameters, read from the current URL and capped at the length the
 *  server accepts. Absent keys submit as empty strings, which the validator
 *  requires — `null` would be rejected as a missing field. */
export function readUtmParameters(): Record<string, string> {
	let query: URLSearchParams;
	try {
		query = new URLSearchParams(window.location.search);
	} catch {
		query = new URLSearchParams();
	}
	const read = (key: string) => (query.get(key) ?? "").slice(0, 100);
	return {
		utm_source: read("utm_source"),
		utm_medium: read("utm_medium"),
		utm_campaign: read("utm_campaign"),
		utm_content: read("utm_content"),
		utm_term: read("utm_term"),
	};
}

export interface LeadSubmitInput {
	leadId: string;
	nome: string;
	email: string;
	whatsapp: string;
	ctaOrigem: string;
	consentimento: boolean;
	consentVersao: string;
	empresa: string;
	startedAt: number;
	signal?: AbortSignal;
}

/** Posts the lead and verifies the acknowledgement. Resolves only when the API
 *  confirms the very lead id that was sent — an opaque 200 is not a receipt.
 *  Throws on anything else, so callers keep one error path. */
export async function postLead(input: LeadSubmitInput): Promise<void> {
	const response = await fetch("/api/leads", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		credentials: "same-origin",
		signal: input.signal,
		body: JSON.stringify({
			lead_id: input.leadId,
			nome_completo: input.nome,
			email: input.email,
			whatsapp: input.whatsapp,
			cta_origem: input.ctaOrigem,
			pagina: LEAD_CANONICAL_PAGE,
			...readUtmParameters(),
			consentimento: input.consentimento,
			consentimento_versao: input.consentVersao,
			empresa: input.empresa,
			form_started_at: input.startedAt,
		}),
	});

	const acknowledgement = (await response.json()) as {
		ok?: unknown;
		leadId?: unknown;
	};

	if (
		!response.ok ||
		acknowledgement.ok !== true ||
		acknowledgement.leadId !== input.leadId
	) {
		throw new Error("invalid_acknowledgement");
	}
}

export interface LeadHandoff {
	lead_id: string;
	lead_name: string;
	lead_email: string;
	lead_phone: string;
	wa_url: string;
}

/** Stores the hand-off for `/redirecionando`, which fires the conversion event
 *  before forwarding to WhatsApp. Returns false when storage is unavailable —
 *  the lead is already accepted at that point, so the caller should skip the
 *  hand-off page and go straight to WhatsApp rather than fail. */
export function writeLeadHandoff(payload: LeadHandoff): boolean {
	try {
		sessionStorage.setItem(LEAD_HANDOFF_KEY, JSON.stringify(payload));
		return true;
	} catch {
		return false;
	}
}
