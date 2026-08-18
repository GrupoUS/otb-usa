#!/usr/bin/env node
/**
 * Deploy check for OTB USA.
 *
 * Answers one question with evidence: is the commit I am looking at the thing
 * production is serving right now?
 *
 * It exists because a commit that never reached `origin/main` looks exactly like
 * a successful one from the local terminal — `git log` shows it, the working
 * tree is clean — while Vercel, which deploys from GitHub, has nothing to build.
 * The landing then stays on the previous build with no error anywhere.
 *
 * Three checks, in the order they fail:
 *   1. HEAD is on `origin/main` (fetches first — a stale ref would lie).
 *   2. `dist/` was built from this working tree.
 *   3. Every page in `dist/` is served byte-for-byte by production. A static
 *      Astro page reaches the CDN unmodified, so the digests match exactly when
 *      the deploy is current — which also catches a copy-only change, where the
 *      hashed asset names would not move at all.
 *
 * Usage:
 *   node scripts/deploy-check.mjs [PRODUCTION_URL] [--wait=SECONDS]
 *   bun run deploy:verify
 *   bun run ship            # gates + push + this check
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const DEFAULT_URL = "https://otb.gpus.com.br";
const DEFAULT_WAIT_SECONDS = 240;
const POLL_INTERVAL_MS = 10_000;

const args = process.argv.slice(2);
const waitArg = args.find((a) => a.startsWith("--wait"));
const urlArg = args.find((a) => !a.startsWith("--"));

const BASE_URL = (urlArg || process.env.PRODUCTION_URL || DEFAULT_URL).replace(
	/\/$/,
	"",
);
const WAIT_SECONDS = waitArg
	? Number.parseInt(waitArg.split("=")[1] ?? String(DEFAULT_WAIT_SECONDS), 10)
	: DEFAULT_WAIT_SECONDS;

const git = (...gitArgs) =>
	execFileSync("git", gitArgs, { encoding: "utf8" }).trim();

const fail = (message, hint) => {
	console.error(`${RED}✗${RESET} ${message}`);
	if (hint) console.error(`${DIM}  → ${hint}${RESET}`);
	process.exit(1);
};

const ok = (message) => console.log(`${GREEN}✓${RESET} ${message}`);

const digest = (text) => createHash("sha256").update(text).digest("hex");

/** Hashed asset references, kept for the failure message: naming which asset
 *  moved says more than "the bytes differ". */
function assetRefs(html) {
	return [...html.matchAll(/\/_astro\/[A-Za-z0-9._-]+\.(?:css|js)/g)]
		.map((match) => match[0])
		.filter((ref, index, all) => all.indexOf(ref) === index)
		.sort();
}

/** Every route the build emitted: `dist/index.html` plus one level of
 *  `dist/<route>/index.html`, which is what this project ships. */
function builtRoutes() {
	const routes = [{ route: "/", file: "dist/index.html" }];
	for (const entry of readdirSync("dist", { withFileTypes: true })) {
		if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
		const file = `dist/${entry.name}/index.html`;
		try {
			readFileSync(file);
			routes.push({ route: `/${entry.name}`, file });
		} catch {
			// Not a page directory (assets, images, og): skip it.
		}
	}
	return routes;
}

async function main() {
	// 1 — is the commit actually on the remote the deploy watches?
	try {
		execFileSync("git", ["fetch", "origin", "main", "--quiet"], {
			stdio: "ignore",
		});
	} catch {
		console.warn(
			`${YELLOW}!${RESET} could not reach origin; comparing against the local ref`,
		);
	}

	const head = git("rev-parse", "HEAD");
	const remote = git("rev-parse", "origin/main");

	if (head !== remote) {
		const ahead = git("rev-list", "--count", "origin/main..HEAD");
		const behind = git("rev-list", "--count", "HEAD..origin/main");
		fail(
			`HEAD (${head.slice(0, 7)}) is not what origin/main points at (${remote.slice(0, 7)}) — ahead ${ahead}, behind ${behind}`,
			ahead !== "0"
				? "the commit never reached GitHub, so Vercel had nothing to build: git push origin main"
				: "pull the remote commits before checking the deploy",
		);
	}
	ok(`origin/main is at ${head.slice(0, 7)}`);

	const dirty = git("status", "--porcelain", "--", "src", "public", "api");
	if (dirty) {
		console.warn(
			`${YELLOW}!${RESET} uncommitted changes under src/public/api — production cannot be serving them:\n${DIM}${dirty}${RESET}`,
		);
	}

	// 2 — was dist/ built from this tree?
	let routes;
	try {
		routes = builtRoutes().map((page) => ({
			...page,
			html: readFileSync(page.file, "utf8"),
		}));
	} catch {
		fail("dist/index.html is missing", "bun run build");
	}

	const expected = assetRefs(routes[0].html);
	if (!expected.length) {
		fail("no hashed assets found in dist/index.html", "bun run build");
	}
	ok(
		`local build: ${routes.length} route(s), ${expected.length} hashed asset(s)`,
	);

	// 3 — is production serving exactly that?
	const deadline = Date.now() + WAIT_SECONDS * 1000;
	let stale = [];
	let attempt = 0;

	while (Date.now() <= deadline) {
		attempt += 1;
		stale = [];

		for (const page of routes) {
			try {
				const response = await fetch(`${BASE_URL}${page.route}`, {
					cache: "no-store",
					headers: { "cache-control": "no-cache" },
				});
				const body = response.ok ? await response.text() : "";
				if (!response.ok || digest(body) !== digest(page.html)) {
					stale.push({
						route: page.route,
						status: response.status,
						served: assetRefs(body),
					});
				}
			} catch (error) {
				stale.push({
					route: page.route,
					status: `unreachable (${error instanceof Error ? error.message : error})`,
					served: [],
				});
			}
		}

		if (!stale.length) {
			ok(
				`${BASE_URL} is serving this exact build on ${routes.length} route(s) (attempt ${attempt})`,
			);
			console.log(`${GREEN}deploy verified${RESET}`);
			return;
		}

		if (Date.now() + POLL_INTERVAL_MS > deadline) break;
		console.log(
			`${DIM}… ${stale.map((page) => page.route).join(", ")} still on a different build, retrying in ${POLL_INTERVAL_MS / 1000}s${RESET}`,
		);
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
	}

	const detail = stale
		.map(
			(page) =>
				`${page.route} (HTTP ${page.status}) serving ${page.served.length ? page.served.join(", ") : "no known assets"}`,
		)
		.join("; ");
	fail(
		`${BASE_URL} is not serving this build after ${WAIT_SECONDS}s`,
		`local assets: ${expected.join(", ")} — stale: ${detail}. Check the deployment log: vercel ls otb-usa`,
	);
}

main().catch((error) => {
	fail(error instanceof Error ? error.message : String(error));
});
