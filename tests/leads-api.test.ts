import { describe, expect, it } from "bun:test";
import handler, { createLeadsHandler } from "../api/leads";
import {
	LEAD_BODY_MAX_BYTES,
	LEAD_CONSENT_VERSION,
	LEAD_MIN_FILL_MS,
} from "../src/lib/leads";
import {
	createSubmissionGate,
	isCompleteLeadName,
} from "../src/lib/lead-client";

const NOW = Date.parse("2026-08-06T15:00:00.000Z");
const SECRET = "local-test-secret-that-is-longer-than-thirty-two-characters";
const WEBAPP_URL = "https://script.google.com/macros/s/local-test/exec";

function validPayload(overrides: Record<string, unknown> = {}) {
	return {
		lead_id: "0191b262-7cc4-4f68-bcd0-8e964da87231",
		nome_completo: "  Ana   Maria  ",
		email: " ANA@EXAMPLE.COM ",
		whatsapp: "(62) 99999-8888",
		cta_origem: "hero",
		pagina: "/",
		utm_source: "google",
		utm_medium: "cpc",
		utm_campaign: "otb",
		utm_content: "hero",
		utm_term: "mba boston",
		consentimento: true,
		consentimento_versao: LEAD_CONSENT_VERSION,
		empresa: "",
		form_started_at: NOW - LEAD_MIN_FILL_MS - 1,
		...overrides,
	};
}

function makeRequest({
	body = validPayload(),
	method = "POST",
	origin = "https://otb.gpus.com.br",
	contentType = "application/json",
}: {
	body?: unknown;
	method?: string;
	origin?: string;
	contentType?: string;
} = {}) {
	const headers = new Headers({ Origin: origin });
	if (contentType) headers.set("Content-Type", contentType);
	return new Request("https://otb.gpus.com.br/api/leads", {
		method,
		headers,
		body: method === "GET" ? undefined : JSON.stringify(body),
	});
}

function createHandler({
	fetchImpl,
	runtimeEnv = "production",
	timeoutMs = 100,
}: {
	fetchImpl?: typeof fetch;
	runtimeEnv?: "production" | "preview" | "development" | "test";
	timeoutMs?: number;
} = {}) {
	return createLeadsHandler({
		env: {
			LEADS_WEBAPP_SECRET: SECRET,
			LEADS_WEBAPP_URL: WEBAPP_URL,
		},
		fetchImpl:
			fetchImpl ??
			(async (_input, init) => {
				const forwarded = JSON.parse(String(init?.body));
				return Response.json({ ok: true, leadId: forwarded.lead_id });
			}),
		now: () => NOW,
		runtimeEnv,
		upstreamTimeoutMs: timeoutMs,
	});
}

async function expectError(response: Response, status: number) {
	expect(response.status).toBe(status);
	expect(response.headers.get("Cache-Control")).toBe("no-store");
	expect(await response.json()).toEqual({ ok: false, error: "request_failed" });
}

describe("POST /api/leads", () => {
	it("exports a Vercel-compatible default handler", () => {
		expect(typeof handler).toBe("function");
	});

	it("rejects methods other than POST", async () => {
		const response = await createHandler()(makeRequest({ method: "GET" }));
		expect(response.headers.get("Allow")).toBe("POST");
		await expectError(response, 405);
	});

	it("requires application/json", async () => {
		await expectError(
			await createHandler()(makeRequest({ contentType: "text/plain" })),
			415,
		);
	});

	it("rejects a disallowed production origin", async () => {
		await expectError(
			await createHandler()(makeRequest({ origin: "https://evil.example" })),
			403,
		);
	});

	it("allows localhost only in local development, never production or test", async () => {
		const localRequest = () =>
			makeRequest({ origin: "http://localhost:4321" });
		expect(
			(await createHandler({ runtimeEnv: "development" })(localRequest())).status,
		).toBe(200);
		await expectError(
			await createHandler({ runtimeEnv: "production" })(localRequest()),
			403,
		);
		await expectError(
			await createHandler({ runtimeEnv: "test" })(localRequest()),
			403,
		);
	});

	it("rejects a body above the byte limit", async () => {
		const body = validPayload({
			utm_content: "x".repeat(LEAD_BODY_MAX_BYTES),
		});
		await expectError(await createHandler()(makeRequest({ body })), 413);
	});

	const invalidCases: Array<[string, Record<string, unknown>]> = [
		["unknown field", { unexpected: "value" }],
		["missing field", { email: undefined }],
		["incomplete name", { nome_completo: "Ana" }],
		["invalid email", { email: "ana.example.com" }],
		["invalid phone", { whatsapp: "phone 123" }],
		["invalid CTA", { cta_origem: "partner" }],
		["non-canonical page", { pagina: "/otb?x=1" }],
		["missing consent", { consentimento: false }],
		["wrong consent version", { consentimento_versao: "v0" }],
		["filled honeypot", { empresa: "bot inc" }],
		["too-fast submit", { form_started_at: NOW - LEAD_MIN_FILL_MS + 1 }],
		["oversized UTM", { utm_source: "x".repeat(101) }],
	];

	it.each(invalidCases)(
		"rejects %s",
		async (_label: string, changes: Record<string, unknown>) => {
			const body: Record<string, unknown> = validPayload(changes);
			if (changes.email === undefined) delete body.email;
			await expectError(await createHandler()(makeRequest({ body })), 400);
		},
	);

	it("accepts an empty e-mail and forwards it as a blank cell", async () => {
		let forwarded: Record<string, unknown> | undefined;
		const fetchImpl: typeof fetch = async (_input, init) => {
			forwarded = JSON.parse(String(init?.body));
			return Response.json({ ok: true, leadId: forwarded?.lead_id });
		};

		const response = await createHandler({ fetchImpl })(
			makeRequest({ body: validPayload({ email: "   " }) }),
		);

		expect(response.status).toBe(200);
		expect(forwarded?.email).toBe("");
	});

	it("accepts the inline application section as a CTA origin", async () => {
		const fetchImpl: typeof fetch = async (_input, init) => {
			const forwarded = JSON.parse(String(init?.body));
			return Response.json({ ok: true, leadId: forwarded.lead_id });
		};

		const response = await createHandler({ fetchImpl })(
			makeRequest({ body: validPayload({ cta_origem: "aplicacao" }) }),
		);

		expect(response.status).toBe(200);
	});

	it("normalizes fields and forwards only the exact schema plus the secret", async () => {
		let forwarded: Record<string, unknown> | undefined;
		const fetchImpl: typeof fetch = async (input, init) => {
			expect(String(input)).toBe(WEBAPP_URL);
			expect(init?.method).toBe("POST");
			forwarded = JSON.parse(String(init?.body));
			return Response.json({ ok: true, leadId: forwarded?.lead_id });
		};

		const response = await createHandler({ fetchImpl })(makeRequest());
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({
			ok: true,
			leadId: "0191b262-7cc4-4f68-bcd0-8e964da87231",
		});
		expect(forwarded).toMatchObject({
			secret: SECRET,
			nome_completo: "Ana Maria",
			email: "ana@example.com",
			whatsapp: "+5562999998888",
			consentimento: "SIM",
			consentimento_versao: LEAD_CONSENT_VERSION,
			recebido_em_utc: "2026-08-06T15:00:00.000Z",
			consentido_em_utc: "2026-08-06T15:00:00.000Z",
		});
		expect(Object.keys(forwarded ?? {})).toEqual([
			"secret",
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
		]);
	});

	it("follows the Apps Script content redirect without forwarding the POST body", async () => {
		const redirectUrl =
			"https://script.googleusercontent.com/macros/echo?user_content_key=test";
		let calls = 0;
		const fetchImpl: typeof fetch = async (input, init) => {
			calls += 1;
			if (calls === 1) {
				expect(String(input)).toBe(WEBAPP_URL);
				expect(init?.method).toBe("POST");
				expect(init?.redirect).toBe("manual");
				return new Response(null, {
					status: 302,
					headers: { Location: redirectUrl },
				});
			}
			expect(String(input)).toBe(redirectUrl);
			expect(init?.method).toBe("GET");
			expect(init?.body).toBeUndefined();
			expect(init?.redirect).toBe("error");
			return Response.json({
				ok: true,
				leadId: "0191b262-7cc4-4f68-bcd0-8e964da87231",
			});
		};

		const response = await createHandler({ fetchImpl })(makeRequest());
		expect(response.status).toBe(200);
		expect(calls).toBe(2);
	});

	it("rejects an Apps Script redirect to an untrusted host", async () => {
		let calls = 0;
		const fetchImpl: typeof fetch = async () => {
			calls += 1;
			return new Response(null, {
				status: 302,
				headers: { Location: "https://evil.example/collect" },
			});
		};
		await expectError(
			await createHandler({ fetchImpl })(makeRequest()),
			502,
		);
		expect(calls).toBe(1);
	});

	it("fails closed on malformed upstream JSON", async () => {
		const fetchImpl: typeof fetch = async () =>
			new Response("not-json", {
				status: 200,
				headers: { "Content-Type": "text/plain" },
			});
		await expectError(
			await createHandler({ fetchImpl })(makeRequest()),
			502,
		);
	});

	it("fails closed on an ACK lead_id mismatch", async () => {
		const fetchImpl: typeof fetch = async () =>
			Response.json({
				ok: true,
				leadId: "31dff523-09d6-41de-ad5a-e867c490e4ff",
			});
		await expectError(
			await createHandler({ fetchImpl })(makeRequest()),
			502,
		);
	});

	it("aborts and fails closed when the writer times out", async () => {
		const fetchImpl: typeof fetch = async (_input, init) =>
			await new Promise<Response>((_resolve, reject) => {
				init?.signal?.addEventListener(
					"abort",
					() => reject(new DOMException("aborted", "AbortError")),
					{ once: true },
				);
			});
		await expectError(
			await createHandler({ fetchImpl, timeoutMs: 5 })(makeRequest()),
			504,
		);
	});
});

describe("client full-name validation", () => {
	it("uses the same normalized name-and-surname rule as the server", () => {
		expect(isCompleteLeadName("Teste")).toBe(false);
		expect(isCompleteLeadName("   Teste   ")).toBe(false);
		expect(isCompleteLeadName("Teste Pessoa")).toBe(true);
		expect(isCompleteLeadName("  Teste   Pessoa  ")).toBe(true);
	});
});

describe("client duplicate-submit guard", () => {
	it("admits one submit until the active attempt finishes", () => {
		const gate = createSubmissionGate();
		expect(gate.tryStart()).toBe(true);
		expect(gate.tryStart()).toBe(false);
		expect(gate.isPending()).toBe(true);
		gate.finish();
		expect(gate.isPending()).toBe(false);
		expect(gate.tryStart()).toBe(true);
	});
});
