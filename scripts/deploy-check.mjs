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
 *   3. The production HTML references the same hashed assets as `dist/`.
 *      Astro hashes by content, so identical asset names mean identical output.
 *
 * Usage:
 *   node scripts/deploy-check.mjs [PRODUCTION_URL] [--wait=SECONDS]
 *   bun run deploy:verify
 *   bun run ship            # gates + push + this check
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

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

/** Hashed asset references are the build fingerprint: Astro derives them from
 *  content, so two pages naming the same files are the same build. */
function assetRefs(html) {
	return [...html.matchAll(/\/_astro\/[A-Za-z0-9._-]+\.(?:css|js)/g)]
		.map((match) => match[0])
		.filter((ref, index, all) => all.indexOf(ref) === index)
		.sort();
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
	let localHtml;
	try {
		localHtml = readFileSync("dist/index.html", "utf8");
	} catch {
		fail("dist/index.html is missing", "bun run build");
	}

	const expected = assetRefs(localHtml);
	if (!expected.length) {
		fail("no hashed assets found in dist/index.html", "bun run build");
	}
	ok(`local build references ${expected.length} hashed asset(s)`);

	// 3 — is production serving that build?
	const deadline = Date.now() + WAIT_SECONDS * 1000;
	let served = [];
	let attempt = 0;

	while (Date.now() <= deadline) {
		attempt += 1;
		try {
			const response = await fetch(`${BASE_URL}/`, {
				cache: "no-store",
				headers: { "cache-control": "no-cache" },
			});
			if (response.ok) {
				served = assetRefs(await response.text());
				if (expected.every((ref) => served.includes(ref))) {
					ok(`${BASE_URL} is serving this build (attempt ${attempt})`);
					console.log(`${GREEN}deploy verified${RESET}`);
					return;
				}
			}
		} catch {
			// Network hiccup or a deployment swapping over: keep polling.
		}

		if (Date.now() + POLL_INTERVAL_MS > deadline) break;
		console.log(
			`${DIM}… production still on a different build, retrying in ${POLL_INTERVAL_MS / 1000}s${RESET}`,
		);
		await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
	}

	fail(
		`${BASE_URL} is not serving this build after ${WAIT_SECONDS}s`,
		`expected ${expected.join(", ")} — got ${served.length ? served.join(", ") : "no assets"}. Check the deployment log: vercel ls otb-usa`,
	);
}

main().catch((error) => {
	fail(error instanceof Error ? error.message : String(error));
});
