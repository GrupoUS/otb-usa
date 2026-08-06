import {
	LEAD_BODY_MAX_BYTES,
	LEAD_UPSTREAM_TIMEOUT_MS,
	validateLeadSubmission,
} from "../src/lib/leads.js";

export const config = { runtime: "nodejs" };

const PRODUCTION_ORIGIN = "https://otb.gpus.com.br";
const LOCAL_ORIGIN_PATTERN = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d{1,5})?$/;
const MAX_UPSTREAM_RESPONSE_BYTES = 2_048;

export type RuntimeEnvironment =
	| "production"
	| "preview"
	| "development"
	| "test";

type Environment = Record<string, string | undefined>;

export interface LeadsHandlerDependencies {
	env: Environment;
	fetchImpl: typeof fetch;
	now: () => number;
	runtimeEnv: RuntimeEnvironment;
	upstreamTimeoutMs: number;
}

function responseHeaders(extra?: HeadersInit): Headers {
	const headers = new Headers(extra);
	headers.set("Cache-Control", "no-store");
	headers.set("Content-Type", "application/json; charset=utf-8");
	headers.set("Vary", "Origin");
	return headers;
}

function failure(status: number, extraHeaders?: HeadersInit): Response {
	return new Response(JSON.stringify({ ok: false, error: "request_failed" }), {
		status,
		headers: responseHeaders(extraHeaders),
	});
}

function success(leadId: string): Response {
	return new Response(JSON.stringify({ ok: true, leadId }), {
		status: 200,
		headers: responseHeaders(),
	});
}

function isAllowedOrigin(origin: string | null, runtimeEnv: RuntimeEnvironment) {
	if (origin === PRODUCTION_ORIGIN) return true;
	if (!origin || runtimeEnv === "production" || runtimeEnv === "test") {
		return false;
	}
	return LOCAL_ORIGIN_PATTERN.test(origin);
}

function readWebAppConfiguration(env: Environment) {
	const url = env.LEADS_WEBAPP_URL?.trim() ?? "";
	const secret = env.LEADS_WEBAPP_SECRET ?? "";
	if (!url || secret.length < 32) return null;

	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "https:" || parsed.hostname !== "script.google.com") {
			return null;
		}
		return { url: parsed.toString(), secret };
	} catch {
		return null;
	}
}

async function readJsonBody(request: Request): Promise<
	| { ok: true; value: unknown }
	| { ok: false; status: number }
> {
	const declaredLength = Number(request.headers.get("Content-Length"));
	if (Number.isFinite(declaredLength) && declaredLength > LEAD_BODY_MAX_BYTES) {
		return { ok: false, status: 413 };
	}

	let text: string;
	try {
		text = await request.text();
	} catch {
		return { ok: false, status: 400 };
	}

	if (new TextEncoder().encode(text).byteLength > LEAD_BODY_MAX_BYTES) {
		return { ok: false, status: 413 };
	}

	try {
		return { ok: true, value: JSON.parse(text) };
	} catch {
		return { ok: false, status: 400 };
	}
}

function isValidAcknowledgement(
	value: unknown,
	leadId: string,
): value is { ok: true; leadId: string } {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		"ok" in value &&
		value.ok === true &&
		"leadId" in value &&
		value.leadId === leadId
	);
}

export function createLeadsHandler(
	dependencies: Partial<LeadsHandlerDependencies> &
		Pick<LeadsHandlerDependencies, "env">,
) {
	const fetchImpl = dependencies.fetchImpl ?? fetch;
	const now = dependencies.now ?? Date.now;
	const runtimeEnv = dependencies.runtimeEnv ?? "development";
	const upstreamTimeoutMs =
		dependencies.upstreamTimeoutMs ?? LEAD_UPSTREAM_TIMEOUT_MS;

	return async function leadsHandler(request: Request): Promise<Response> {
		if (request.method !== "POST") {
			return failure(405, { Allow: "POST" });
		}

		if (!isAllowedOrigin(request.headers.get("Origin"), runtimeEnv)) {
			return failure(403);
		}

		const contentType = request.headers.get("Content-Type")?.toLowerCase() ?? "";
		if (!contentType.startsWith("application/json")) {
			return failure(415);
		}

		const body = await readJsonBody(request);
		if (body.ok === false) return failure(body.status);

		const validation = validateLeadSubmission(body.value, now());
		if (!validation.ok) return failure(400);

		const webApp = readWebAppConfiguration(dependencies.env);
		if (!webApp) return failure(500);

		const upstreamPayload = {
			secret: webApp.secret,
			...validation.row,
		};
		const abortController = new AbortController();
		const timeout = setTimeout(() => abortController.abort(), upstreamTimeoutMs);

		try {
			const initialUpstreamResponse = await fetchImpl(webApp.url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(upstreamPayload),
				signal: abortController.signal,
				redirect: "manual",
			});

			let upstreamResponse = initialUpstreamResponse;
			if (
				initialUpstreamResponse.status === 301 ||
				initialUpstreamResponse.status === 302 ||
				initialUpstreamResponse.status === 303
			) {
				const location = initialUpstreamResponse.headers.get("location");
				if (!location) return failure(502);

				let redirectUrl: URL;
				try {
					redirectUrl = new URL(location);
				} catch {
					return failure(502);
				}

				if (
					redirectUrl.protocol !== "https:" ||
					redirectUrl.hostname !== "script.googleusercontent.com"
				) {
					return failure(502);
				}

				upstreamResponse = await fetchImpl(redirectUrl.toString(), {
					method: "GET",
					signal: abortController.signal,
					redirect: "error",
				});
			} else if (
				initialUpstreamResponse.status >= 300 &&
				initialUpstreamResponse.status < 400
			) {
				return failure(502);
			}

			if (!upstreamResponse.ok) return failure(502);
			const responseText = await upstreamResponse.text();
			if (
				new TextEncoder().encode(responseText).byteLength >
				MAX_UPSTREAM_RESPONSE_BYTES
			) {
				return failure(502);
			}

			let acknowledgement: unknown;
			try {
				acknowledgement = JSON.parse(responseText);
			} catch {
				return failure(502);
			}

			if (
				!isValidAcknowledgement(
					acknowledgement,
					validation.row.lead_id,
				)
			) {
				return failure(502);
			}
			return success(validation.row.lead_id);
		} catch (error) {
			if (
				abortController.signal.aborted ||
				(error instanceof DOMException && error.name === "AbortError")
			) {
				return failure(504);
			}
			return failure(502);
		} finally {
			clearTimeout(timeout);
		}
	};
}

function runtimeEnvironment(env: Environment): RuntimeEnvironment {
	if (env.NODE_ENV === "test") return "test";
	if (env.VERCEL_ENV === "production" || env.NODE_ENV === "production") {
		return "production";
	}
	if (env.VERCEL_ENV === "preview") return "preview";
	return "development";
}

function serverEnvironment(): Environment {
	const runtime = globalThis as typeof globalThis & {
		process?: { env?: Environment };
	};
	return runtime.process?.env ?? {};
}

type NodeRequest = {
	body?: unknown;
	headers: Record<string, string | string[] | undefined>;
	method?: string;
	url?: string;
};

type NodeResponse = {
	statusCode: number;
	setHeader(name: string, value: string): void;
	end(body?: string): void;
};

function toWebRequest(request: NodeRequest): Request {
	const headers = new Headers();
	for (const [name, value] of Object.entries(request.headers)) {
		if (Array.isArray(value)) {
			for (const item of value) headers.append(name, item);
		} else if (typeof value === "string") {
			headers.set(name, value);
		}
	}

	const method = request.method ?? "GET";
	const url = new URL(request.url ?? "/api/leads", "https://otb.gpus.com.br");
	let body: string | undefined;
	if (method !== "GET" && method !== "HEAD" && request.body !== undefined) {
		body =
			typeof request.body === "string"
				? request.body
				: JSON.stringify(request.body);
	}
	return new Request(url, { method, headers, body });
}

export default async function handler(
	request: NodeRequest,
	response: NodeResponse,
): Promise<void> {
	const env = serverEnvironment();
	const result = await createLeadsHandler({
		env,
		runtimeEnv: runtimeEnvironment(env),
	})(toWebRequest(request));
	response.statusCode = result.status;
	result.headers.forEach((value, name) => response.setHeader(name, value));
	response.end(await result.text());
}
