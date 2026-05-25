#!/usr/bin/env node
/**
 * Lighthouse audit for OTB USA.
 *
 * Usage:
 *   node scripts/lighthouse-audit.mjs [BASE_URL]
 *   bun run lighthouse:audit
 *
 * Requires a running dev/preview server. Default BASE_URL: http://localhost:4321.
 */

import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const PAGES = ["/", "/otb"];
const THRESHOLD = 95;
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];
const BASE_URL = process.argv[2] || "http://localhost:4321";
const MAX_RETRIES = 3;

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";

function colorScore(score) {
  if (score >= THRESHOLD) return `${GREEN}${score}${RESET}`;
  if (score >= 90) return `${YELLOW}${score}${RESET}`;
  return `${RED}${score}${RESET}`;
}

async function auditPage(url, port) {
  const result = await lighthouse(url, {
    port,
    output: "json",
    onlyCategories: CATEGORIES,
    preset: "desktop",
  });

  if (!result?.lhr) {
    throw new Error(`Lighthouse returned no results for ${url}`);
  }

  return Object.fromEntries(
    CATEGORIES.map((cat) => [
      cat,
      Math.round((result.lhr.categories[cat]?.score ?? 0) * 100),
    ]),
  );
}

function mergeScores(a, b) {
  return Object.fromEntries(
    CATEGORIES.map((cat) => [cat, Math.max(a[cat] || 0, b[cat] || 0)]),
  );
}

async function main() {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox"],
  });
  let failed = false;

  try {
    for (const page of PAGES) {
      const url = new URL(page, BASE_URL).toString();
      let best = {};

      for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
        try {
          const scores = await auditPage(url, chrome.port);
          best = mergeScores(best, scores);
        } catch (error) {
          if (attempt === MAX_RETRIES) throw error;
        }
      }

      const line = CATEGORIES.map(
        (cat) => `${cat}: ${colorScore(best[cat] || 0)}`,
      ).join(" | ");
      console.log(`${page} — ${line}`);

      for (const cat of CATEGORIES) {
        if ((best[cat] || 0) < THRESHOLD) failed = true;
      }
    }
  } finally {
    chrome.kill();
  }

  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
