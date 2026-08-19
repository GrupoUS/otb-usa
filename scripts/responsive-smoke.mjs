#!/usr/bin/env bun
/**
 * Responsive + conversion smoke for the OTB USA landing.
 *
 * Usage:
 *   bun run smoke                       # against http://localhost:4321
 *   bun run smoke -- https://otb.gpus.com.br
 *   bun run smoke -- --shots            # also writes PNGs to .smoke/
 *
 * Needs a server already running (`bun run preview` after `bun run build`).
 *
 * Why this file exists: issue #1 asks for "smoke visual/responsivo com
 * evidências". Evidence that lives in a chat transcript is not evidence anyone
 * can reproduce — this turns the manual pass into a command with an exit code.
 *
 * It drives headless Chrome over the DevTools protocol directly (chrome-launcher
 * is already a devDependency for Lighthouse; no browser automation library is
 * added for this).
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import * as chromeLauncher from "chrome-launcher";

const args = process.argv.slice(2);
const BASE_URL = args.find((a) => a.startsWith("http")) ?? "http://localhost:4321";
const SHOTS = args.includes("--shots");
const SHOT_DIR = ".smoke";

/* Viewport heights, not screen heights. A phone with a 844px screen hands the
   page ~664px once Safari's chrome is on it, and 1366x768 becomes 1366x657 in
   Chrome — which is where the fold assertions actually bite. Testing screen
   heights is how a fold defect passes a green smoke. */
const VIEWPORTS = [
	{ name: "iphone-se", width: 375, height: 553, mobile: true },
	{ name: "iphone-14", width: 390, height: 664, mobile: true },
	{ name: "ipad", width: 768, height: 954, mobile: true },
	{ name: "laptop-hd", width: 1366, height: 657, mobile: false },
	{ name: "macbook-air", width: 1440, height: 789, mobile: false },
	{ name: "desktop", width: 1440, height: 900, mobile: false },
];

/** Minimum touch target from .claude/rules/DESIGN.md § 3. */
const MIN_TOUCH = 44;

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const failures = [];
const ok = (label, detail = "") =>
	console.log(`  ${GREEN}✓${RESET} ${label}${detail ? ` ${DIM}${detail}${RESET}` : ""}`);
const fail = (label, detail) => {
	console.log(`  ${RED}✗${RESET} ${label} ${DIM}${detail}${RESET}`);
	failures.push(`${label} — ${detail}`);
};
const check = (condition, label, detail) =>
	condition ? ok(label, detail) : fail(label, detail);

/* ---------------------------------------------------------------- CDP glue */

function connect(webSocketDebuggerUrl) {
	const ws = new WebSocket(webSocketDebuggerUrl);
	let id = 0;
	const pending = new Map();
	const consoleErrors = [];

	ws.onmessage = (message) => {
		const payload = JSON.parse(message.data);
		if (payload.id && pending.has(payload.id)) {
			pending.get(payload.id)(payload.result);
			pending.delete(payload.id);
			return;
		}
		if (payload.method === "Log.entryAdded" && payload.params.entry.level === "error") {
			consoleErrors.push(payload.params.entry.text);
		}
		if (payload.method === "Runtime.exceptionThrown") {
			consoleErrors.push(payload.params.exceptionDetails.text);
		}
	};

	const send = (method, params = {}) =>
		new Promise((resolve) => {
			const next = ++id;
			pending.set(next, resolve);
			ws.send(JSON.stringify({ id: next, method, params }));
		});

	const evaluate = async (expression) => {
		const result = await send("Runtime.evaluate", {
			expression,
			returnByValue: true,
			awaitPromise: true,
		});
		return JSON.parse(result.result.value);
	};

	const ready = new Promise((resolve) => {
		ws.onopen = resolve;
	});

	return { ws, send, evaluate, consoleErrors, ready };
}

/* ------------------------------------------------------- in-page probes */

/* The fold assertions are pinned to the SSOT, not to a text heuristic: the page
   carries several date+place strings and guessing picks the wrong one. */
const product = JSON.parse(
	readFileSync(new URL("../src/content/products/otb.json", import.meta.url), "utf8"),
);
const EYEBROW = product.hero.eyebrow;

const FOLD_PROBE = `(() => {
	const vw = window.innerWidth;
	const vh = window.innerHeight;
	const visible = (el) => {
		if (!el) return false;
		const style = getComputedStyle(el);
		return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0.01;
	};
	const box = (el) => {
		if (!el) return null;
		const r = el.getBoundingClientRect();
		return { top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) };
	};
	const needle = ${JSON.stringify(EYEBROW)};
	// The eyebrow wraps a decorative rule, so it has children; match on its
	// normalised text and take the tightest element that carries exactly it.
	const eyebrow = [...document.querySelectorAll("p,span,div,h2")]
		.filter((el) => el.textContent.replace(/\\s+/g, " ").trim() === needle)
		.sort((a, b) => a.querySelectorAll("*").length - b.querySelectorAll("*").length)[0];
	const h1 = document.querySelector("h1");
	const cta = document.querySelector('[data-lead-cta="hero"]');
	let hit = "sem-cta";
	if (cta) {
		const r = cta.getBoundingClientRect();
		const cx = Math.round(r.left + r.width / 2);
		const cy = Math.round(r.top + r.height / 2);
		if (cy < 0 || cy > vh) hit = "fora-da-dobra";
		else {
			const el = document.elementFromPoint(cx, cy);
			hit = el && (el === cta || cta.contains(el) || cta.contains(el.parentElement)) ? "livre" : "obstruido-por:" + (el ? el.tagName : "nada");
		}
	}
	/* documentElement.scrollWidth is useless here: html/body carry
	   \`overflow-x: clip\`, so the root is clamped and a genuine 3000px overflow
	   still measures 0. Walk content elements instead and ignore anything a
	   clipping ancestor is deliberately hiding (decorative glows, marquee track). */
	const clippedByAncestor = (el) => {
		for (let p = el.parentElement; p; p = p.parentElement) {
			const s = getComputedStyle(p);
			if (s.overflowX === "hidden" || s.overflowX === "clip") return true;
		}
		return false;
	};
	const spilling = [...document.querySelectorAll("body *")]
		.filter((el) => {
			if (el.closest('[aria-hidden="true"]')) return false;
			const r = el.getBoundingClientRect();
			if (r.width === 0 || r.height === 0) return false;
			if (r.right <= vw + 1 && r.left >= -1) return false;
			return !clippedByAncestor(el);
		})
		.slice(0, 4)
		.map((el) => el.tagName + "." + String(el.className).slice(0, 40) + " right=" + Math.round(el.getBoundingClientRect().right));

	/* The floating WhatsApp button is fixed and above everything; if it lands on
	   top of fold content, the reader loses that content with no way to move it. */
	const float = document.querySelector("[data-float-wa]");
	const covered = [];
	if (float && getComputedStyle(float).display !== "none") {
		document.querySelectorAll("#topo dl > div, #topo a, #topo button, #topo li").forEach((el) => {
			const r = el.getBoundingClientRect();
			if (r.top < 0 || r.bottom > vh || r.width === 0) return;
			const el2 = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
			if (el2 && (el2 === float || float.contains(el2))) covered.push(el.textContent.replace(/\s+/g, " ").trim().slice(0, 40));
		});
	}

	return JSON.stringify({
		viewport: { vw, vh },
		coveredByFloat: covered,
		spilling,
		overflowX: document.documentElement.scrollWidth - vw,
		h1Count: document.querySelectorAll("h1").length,
		eyebrow: { visible: visible(eyebrow), box: box(eyebrow), text: eyebrow ? eyebrow.textContent.trim().slice(0, 60) : null },
		h1: { visible: visible(h1), box: box(h1) },
		cta: { visible: visible(cta), box: box(cta), hit },
	});
})()`;

const SCROLLED_PROBE = `(() => {
	const vh = window.innerHeight;
	const onScreen = (el) => {
		if (!el) return false;
		const style = getComputedStyle(el);
		if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) < 0.05) return false;
		const r = el.getBoundingClientRect();
		return r.bottom > 0 && r.top < vh && r.width > 0;
	};
	const sticky = document.querySelector("[data-sticky-cta]");
	const float = document.querySelector("[data-float-wa]");
	let overlap = false;
	if (onScreen(sticky) && onScreen(float)) {
		const a = sticky.getBoundingClientRect();
		const b = float.getBoundingClientRect();
		overlap = !(a.right < b.left || b.right < a.left || a.bottom < b.top || b.bottom < a.top);
	}
	return JSON.stringify({
		stickyVisivel: onScreen(sticky),
		stickyTexto: sticky ? sticky.textContent.replace(/\\s+/g, " ").trim().slice(0, 70) : null,
		sobreposicao: overlap,
	});
})()`;

const MODAL_PROBE = `(() => new Promise((resolve) => {
	const trigger = document.querySelector('[data-lead-cta="hero"]');
	if (!trigger) return resolve(JSON.stringify({ erro: "sem CTA do hero" }));
	trigger.click();
	setTimeout(() => {
		const dialog = document.querySelector("[data-lead-dialog]");
		if (!dialog) return resolve(JSON.stringify({ erro: "sem [data-lead-dialog]" }));
		const fields = [...dialog.querySelectorAll("input:not([type=hidden])")].map((input) => ({
			name: input.name,
			labelled: Boolean(input.labels && input.labels.length),
		}));
		const consent = dialog.querySelector('a[href^="http"]');
		resolve(JSON.stringify({
			aberto: dialog.open === true && dialog.matches(":modal"),
			foco: document.activeElement ? document.activeElement.name || document.activeElement.tagName : null,
			campos: fields,
			semLabel: fields.filter((f) => !f.labelled).map((f) => f.name),
			consentHref: consent ? consent.getAttribute("href") : null,
		}));
	}, 700);
}))()`;

/* --------------------------------------------------------------- runner */

const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });

try {
	const target = await (
		await fetch(`http://localhost:${chrome.port}/json/new?about:blank`, { method: "PUT" })
	).json();
	const cdp = connect(target.webSocketDebuggerUrl);
	await cdp.ready;
	await cdp.send("Runtime.enable");
	await cdp.send("Log.enable");
	await cdp.send("Page.enable");

	if (SHOTS) mkdirSync(SHOT_DIR, { recursive: true });
	console.log(`Smoke responsivo — ${BASE_URL}\n`);

	for (const viewport of VIEWPORTS) {
		cdp.consoleErrors.length = 0;
		console.log(`${viewport.name} ${viewport.width}×${viewport.height}`);

		await cdp.send("Emulation.setDeviceMetricsOverride", {
			width: viewport.width,
			height: viewport.height,
			deviceScaleFactor: 1,
			mobile: viewport.mobile,
		});
		await cdp.send("Page.navigate", { url: BASE_URL });
		await Bun.sleep(2500);

		const fold = await cdp.evaluate(FOLD_PROBE);
		check(
			fold.spilling.length === 0,
			"nenhum conteúdo transborda a viewport",
			fold.spilling.join(" | ") || `raiz: ${fold.overflowX}px`,
		);
		check(fold.h1Count === 1, "um único <h1>", `${fold.h1Count} encontrado(s)`);
		check(
			fold.eyebrow.visible && fold.eyebrow.box && fold.eyebrow.box.bottom <= fold.viewport.vh,
			"edição/local na primeira dobra",
			fold.eyebrow.text ?? "não encontrado",
		);
		check(
			fold.h1.visible && fold.h1.box && fold.h1.box.bottom <= fold.viewport.vh,
			"proposta de valor na primeira dobra",
			JSON.stringify(fold.h1.box),
		);
		check(
			fold.cta.visible && fold.cta.box && fold.cta.box.bottom <= fold.viewport.vh,
			"CTA principal na primeira dobra",
			JSON.stringify(fold.cta.box),
		);
		check(fold.cta.hit === "livre", "CTA sem obstrução", fold.cta.hit);
		check(
			fold.coveredByFloat.length === 0,
			"botão flutuante não cobre conteúdo da dobra",
			fold.coveredByFloat.join(" | ") || "",
		);
		check(
			Boolean(fold.cta.box) && fold.cta.box.height >= MIN_TOUCH,
			`alvo tátil ≥ ${MIN_TOUCH}px`,
			`${fold.cta.box ? fold.cta.box.height : 0}px`,
		);

		if (SHOTS) {
			const shot = await cdp.send("Page.captureScreenshot", { format: "png" });
			writeFileSync(`${SHOT_DIR}/fold-${viewport.name}.png`, Buffer.from(shot.data, "base64"));
		}

		await cdp.send("Runtime.evaluate", {
			expression: "window.scrollTo(0, document.body.scrollHeight * 0.5)",
		});
		await Bun.sleep(1200);

		const scrolled = await cdp.evaluate(SCROLLED_PROBE);
		check(scrolled.stickyVisivel, "barra de conversão aparece ao rolar", scrolled.stickyTexto ?? "");
		check(!scrolled.sobreposicao, "barra e botão flutuante não se sobrepõem", "");

		const modal = await cdp.evaluate(MODAL_PROBE);
		if (modal.erro) {
			fail("modal de lead abre pelo CTA", modal.erro);
		} else {
			check(modal.aberto, "modal de lead abre pelo CTA", `foco em ${modal.foco}`);
			check(modal.semLabel.length === 0, "todo campo tem <label>", modal.semLabel.join(", ") || "ok");
			check(
				Boolean(modal.consentHref && modal.consentHref.includes("privacidade")),
				"consentimento com link de privacidade",
				modal.consentHref ?? "ausente",
			);
		}

		await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
		await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 });
		await Bun.sleep(400);
		const closed = await cdp.evaluate(
			`(() => { const d = document.querySelector("[data-lead-dialog]"); return JSON.stringify({ aberto: d ? d.open === true : false, foco: document.activeElement ? document.activeElement.getAttribute("data-lead-cta") : null }); })()`,
		);
		check(!closed.aberto, "Escape fecha o modal", "");
		check(closed.foco === "hero", "foco volta para o gatilho", closed.foco ?? "perdido");

		check(cdp.consoleErrors.length === 0, "console sem erros", cdp.consoleErrors.join(" | ") || "");
		console.log("");
	}

	cdp.ws.close();
} finally {
	chrome.kill();
}

if (failures.length) {
	console.log(`${RED}${failures.length} verificação(ões) falharam:${RESET}`);
	for (const failure of failures) console.log(`  - ${failure}`);
	process.exitCode = 1;
} else {
	console.log(`${GREEN}Smoke responsivo: tudo passou.${RESET}`);
}
