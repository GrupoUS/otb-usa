#!/usr/bin/env node
/**
 * Lighthouse CI Audit Script
 *
 * Audits all 9 content pages against configurable thresholds across
 * Performance, Accessibility, Best Practices, and SEO categories.
 *
 * Usage:
 *   node scripts/lighthouse-audit.mjs [BASE_URL]
 *   bun run lighthouse:audit
 *
 * Requires:
 *   - Google Chrome installed (google-chrome or CHROME_PATH env var)
 *   - A running preview/dev server (default: http://localhost:4321)
 *
 * Retry logic: If a page fails on first run, it retries up to 2 more times
 * (3 total) and takes the BEST score per category to handle Lighthouse variance.
 */

import { existsSync } from "node:fs";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PAGES = [
	"/",
	"/sobre",
	"/curso-auriculo",
	"/mentoria-black-neon",
	"/comunidade-us",
	"/otb",
	"/neon-dash",
	"/contato",
	"/404",
];

const THRESHOLD = 95;

const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];

const BASE_URL = process.argv[2] || "http://localhost:4321";

const MAX_RETRIES = 3;

// ANSI color codes
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Pads or truncates a string to the given width.
 * @param {string} str
 * @param {number} width
 * @returns {string}
 */
function pad(str, width) {
	const s = String(str);
	return s.length >= width ? s.slice(0, width) : s + " ".repeat(width - s.length);
}

/**
 * Colorizes a score based on the threshold.
 * @param {number} score
 * @returns {string}
 */
function colorScore(score) {
	if (score >= THRESHOLD) return `${GREEN}${score}${RESET}`;
	if (score >= 90) return `${YELLOW}${score}${RESET}`;
	return `${RED}${score}${RESET}`;
}

/**
 * Run a single Lighthouse audit and return scores per category.
 * @param {string} url
 * @param {number} port - Chrome debugging port
 * @returns {Promise<Record<string, number>>}
 */
async function auditPage(url, port) {
	const result = await lighthouse(url, {
		port,
		output: "json",
		onlyCategories: CATEGORIES,
		preset: "desktop",
	});

	if (!result || !result.lhr) {
		throw new Error(`Lighthouse returned no results for ${url}`);
	}

	/** @type {Record<string, number>} */
	const scores = {};
	for (const cat of CATEGORIES) {
		const category = result.lhr.categories[cat];
		scores[cat] = category ? Math.round(category.score * 100) : 0;
	}
	return scores;
}

/**
 * Merge two score objects, keeping the best (highest) per category.
 * @param {Record<string, number>} a
 * @param {Record<string, number>} b
 * @returns {Record<string, number>}
 */
function mergeScores(a, b) {
	/** @type {Record<string, number>} */
	const merged = {};
	for (const cat of CATEGORIES) {
		merged[cat] = Math.max(a[cat] || 0, b[cat] || 0);
	}
	return merged;
}

/**
 * Check whether all categories meet the threshold.
 * @param {Record<string, number>} scores
 * @returns {boolean}
 */
function meetsThreshold(scores) {
	return CATEGORIES.every((cat) => (scores[cat] || 0) >= THRESHOLD);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	console.log(`\n${BOLD}Lighthouse CI Audit${RESET}`);
	console.log(`${DIM}Base URL: ${BASE_URL}${RESET}`);
	console.log(`${DIM}Threshold: ${THRESHOLD} across ${CATEGORIES.join(", ")}${RESET}`);
	console.log(`${DIM}Pages: ${PAGES.length}${RESET}\n`);

	// Launch Chrome
	/** @type {import('chrome-launcher').LaunchedChrome | null} */
	let chrome = null;

	try {
		// Resolve Chrome binary: env var > common system paths > auto-detect
		const CHROME_CANDIDATES = [
			process.env.CHROME_PATH,
			"/usr/bin/google-chrome-stable",
			"/usr/bin/google-chrome",
			"/usr/sbin/google-chrome",
			"/usr/bin/chromium-browser",
			"/usr/bin/chromium",
		];
		const chromePath = CHROME_CANDIDATES.find((p) => p && existsSync(p));

		chrome = await chromeLauncher.launch({
			chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
			...(chromePath ? { chromePath } : {}),
		});

		console.log(`${DIM}Chrome launched on port ${chrome.port}${RESET}\n`);
	} catch (err) {
		console.error(
			`${RED}Error: Chrome not found. Install Chrome in WSL:${RESET}`,
		);
		console.error(
			"wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && sudo apt -y install ./google-chrome-stable_current_amd64.deb",
		);
		console.error(
			`\n${DIM}Or set CHROME_PATH to your Chrome/Chromium binary.${RESET}`,
		);
		process.exit(1);
	}

	/** @type {Array<{page: string, scores: Record<string, number>, pass: boolean, retries: number}>} */
	const results = [];
	const failures = [];

	try {
		for (const page of PAGES) {
			const url = `${BASE_URL}${page}`;
			process.stdout.write(`  Auditing ${pad(page, 24)} `);

			let bestScores = {};
			let retries = 0;

			// First run
			try {
				bestScores = await auditPage(url, chrome.port);
			} catch (err) {
				console.error(`\n${RED}  Error auditing ${page}: ${err.message}${RESET}`);
				results.push({ page, scores: {}, pass: false, retries: 0 });
				failures.push({ page, scores: {}, failing: CATEGORIES });
				continue;
			}

			// Retry logic: if first run fails threshold, retry up to 2 more times
			while (!meetsThreshold(bestScores) && retries < MAX_RETRIES - 1) {
				retries++;
				process.stdout.write(`${DIM}(retry ${retries})${RESET} `);
				try {
					const retryScores = await auditPage(url, chrome.port);
					bestScores = mergeScores(bestScores, retryScores);
				} catch {
					// Retry failed, keep best scores so far
				}
			}

			const pass = meetsThreshold(bestScores);
			const status = pass
				? `${GREEN}PASS${RESET}`
				: `${RED}FAIL${RESET}`;

			// Print inline scores
			const scoreStr = CATEGORIES.map(
				(cat) => colorScore(bestScores[cat] || 0),
			).join("  ");
			console.log(`${scoreStr}  ${status}${retries > 0 ? ` ${DIM}(best of ${retries + 1})${RESET}` : ""}`);

			results.push({ page, scores: bestScores, pass, retries });

			if (!pass) {
				const failing = CATEGORIES.filter(
					(cat) => (bestScores[cat] || 0) < THRESHOLD,
				);
				failures.push({ page, scores: bestScores, failing });
			}
		}
	} finally {
		// Always clean up Chrome
		if (chrome) {
			await chrome.kill();
			console.log(`\n${DIM}Chrome closed.${RESET}`);
		}
	}

	// ---------------------------------------------------------------------------
	// Summary table
	// ---------------------------------------------------------------------------

	console.log(`\n${BOLD}Summary${RESET}\n`);

	const COL_PAGE = 24;
	const COL_SCORE = 6;

	const header =
		`${pad("Page", COL_PAGE)} | ${pad("Perf", COL_SCORE)} | ${pad("A11y", COL_SCORE)} | ${pad("BP", COL_SCORE)} | ${pad("SEO", COL_SCORE)} | Status`;
	const separator = "-".repeat(header.length + 10);

	console.log(header);
	console.log(separator);

	for (const r of results) {
		const perf = pad(String(r.scores.performance ?? "-"), COL_SCORE);
		const a11y = pad(String(r.scores.accessibility ?? "-"), COL_SCORE);
		const bp = pad(String(r.scores["best-practices"] ?? "-"), COL_SCORE);
		const seo = pad(String(r.scores.seo ?? "-"), COL_SCORE);
		const status = r.pass ? `${GREEN}PASS${RESET}` : `${RED}FAIL${RESET}`;

		console.log(
			`${pad(r.page, COL_PAGE)} | ${perf} | ${a11y} | ${bp} | ${seo} | ${status}`,
		);
	}

	console.log(separator);

	// ---------------------------------------------------------------------------
	// Final result
	// ---------------------------------------------------------------------------

	const allPassed = failures.length === 0;

	if (allPassed) {
		console.log(
			`\n${GREEN}${BOLD}All ${PAGES.length} pages meet the ${THRESHOLD} threshold across all categories.${RESET}\n`,
		);
		process.exit(0);
	} else {
		console.log(
			`\n${RED}${BOLD}${failures.length} page(s) failed to meet the ${THRESHOLD} threshold:${RESET}\n`,
		);

		for (const f of failures) {
			const failingCats = f.failing
				.map((cat) => `${cat}: ${f.scores[cat] ?? "N/A"}`)
				.join(", ");
			console.log(`  ${RED}${f.page}${RESET} - ${failingCats}`);
		}

		console.log("");
		process.exit(1);
	}
}

main().catch((err) => {
	console.error(`${RED}Unexpected error: ${err.message}${RESET}`);
	process.exit(1);
});
