#!/usr/bin/env node
/**
 * Lighthouse audit for OTB USA.
 *
 * Usage:
 *   node scripts/lighthouse-audit.mjs [BASE_URL]
 *   bun run lighthouse:audit
 *
 * Requires a running dev/preview server. Default BASE_URL: http://localhost:4321.
 *
 * Two deliberate choices, both learned the hard way:
 *
 *   - BOTH form factors. The old script ran `preset: "desktop"` only, and the
 *     regression that mattered (LCP 6.7s) only ever showed on mobile.
 *   - MEDIAN of the runs, not the max. Taking the best of three turns a noisy
 *     93 into a reported 96 and hides exactly the drift a gate exists to catch.
 *
 * Only `/` is audited: `/otb` is a 301 to `/`, and `/redirecionando` sends the
 * visitor straight back to `/` when sessionStorage has no lead — auditing
 * either just measures the home page through a redirect.
 */

import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";

const PAGES = ["/"];
const FORM_FACTORS = ["mobile", "desktop"];
const THRESHOLD = 95;
const CATEGORIES = ["performance", "accessibility", "best-practices", "seo"];
const VITALS = {
  "largest-contentful-paint": "LCP",
  "cumulative-layout-shift": "CLS",
  "total-blocking-time": "TBT",
};
const BASE_URL = process.argv[2] || "http://localhost:4321";
const RUNS = 3;

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

function colorScore(score) {
  if (score >= THRESHOLD) return `${GREEN}${score}${RESET}`;
  if (score >= 90) return `${YELLOW}${score}${RESET}`;
  return `${RED}${score}${RESET}`;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : sorted[mid];
}

async function auditPage(url, port, formFactor) {
  const result = await lighthouse(url, {
    port,
    output: "json",
    onlyCategories: CATEGORIES,
    // `preset: "desktop"` bundles the desktop throttling + emulation; mobile is
    // Lighthouse's own default, so it needs no preset.
    ...(formFactor === "desktop" ? { preset: "desktop" } : {}),
  });

  if (!result?.lhr) {
    throw new Error(`Lighthouse returned no results for ${url} (${formFactor})`);
  }

  const scores = Object.fromEntries(
    CATEGORIES.map((cat) => [
      cat,
      Math.round((result.lhr.categories[cat]?.score ?? 0) * 100),
    ]),
  );
  const vitals = Object.fromEntries(
    Object.keys(VITALS).map((id) => [
      id,
      result.lhr.audits[id]?.numericValue ?? Number.NaN,
    ]),
  );

  return { scores, vitals };
}

function formatVitals(vitals) {
  return Object.entries(VITALS)
    .map(([id, label]) => {
      const value = vitals[id];
      if (!Number.isFinite(value)) return `${label}: —`;
      if (label === "CLS") return `${label}: ${value.toFixed(3)}`;
      return `${label}: ${(value / 1000).toFixed(2)}s`;
    })
    .join(" · ");
}

async function main() {
  const chrome = await chromeLauncher.launch({
    chromeFlags: ["--headless", "--no-sandbox"],
  });
  let failed = false;

  try {
    for (const page of PAGES) {
      const url = new URL(page, BASE_URL).toString();

      for (const formFactor of FORM_FACTORS) {
        const runs = [];

        for (let attempt = 1; attempt <= RUNS; attempt += 1) {
          try {
            runs.push(await auditPage(url, chrome.port, formFactor));
          } catch (error) {
            if (runs.length === 0 && attempt === RUNS) throw error;
          }
        }

        const scores = Object.fromEntries(
          CATEGORIES.map((cat) => [cat, median(runs.map((r) => r.scores[cat]))]),
        );
        const vitals = Object.fromEntries(
          Object.keys(VITALS).map((id) => [
            id,
            median(runs.map((r) => r.vitals[id]).filter(Number.isFinite)),
          ]),
        );

        const line = CATEGORIES.map(
          (cat) => `${cat}: ${colorScore(scores[cat] || 0)}`,
        ).join(" | ");
        console.log(`${page} [${formFactor}] — ${line}`);
        console.log(`${DIM}    ${formatVitals(vitals)} (mediana de ${runs.length})${RESET}`);

        for (const cat of CATEGORIES) {
          if ((scores[cat] || 0) < THRESHOLD) failed = true;
        }
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
