/**
 * Shared scroll/pointer runtime for the landing.
 *
 * Everything here is additive to markup that is already complete without JS.
 * Two rules govern the file:
 *
 *   1. ONE scroll listener. Every scroll-driven behaviour registers a task and
 *      the single `scroll` handler drains them inside one `requestAnimationFrame`.
 *      Four independent listeners (progress bar, sticky bar, parallax, hero fade)
 *      each with their own rAF token is four layout passes per frame.
 *   2. `prefers-reduced-motion: reduce` disables every *decorative* behaviour.
 *      Chrome that carries information — the reading progress bar, the sticky
 *      conversion bar, the countdown — keeps working, because switching it off
 *      would remove content, not motion.
 *
 * Attribute contract (see DESIGN.md § Motion):
 *   [data-reveal]          — CSS-driven, observed in Layout.astro (not here)
 *   [data-enter="n"]       — load cascade, 700ms, delay n × 0.06s
 *   [data-count]           — count-up once the figure scrolls in
 *   [data-parallax]        — plate wrapper translated against scroll
 *   [data-tilt]            — writes --tilt-x/--tilt-y/--tilt-lift for CSS
 *   [data-marquee]         — duplicates its children into an infinite track
 *   [data-shine]           — injects the sweep span over a CTA
 *   [data-hpin]            — horizontal rail pinned while the section scrolls
 *   [data-cd]/[data-cd-mini]/[data-cd-wrap] — live countdown
 *   [data-hero-fade]       — hero content fades out as the fold leaves
 *   [data-scroll-progress] — reading indicator
 *   [data-sticky-cta]/[data-float-wa] — bottom conversion chrome
 */

interface ScrollState {
	/** window.scrollY */
	y: number;
	/** window.innerHeight */
	vh: number;
	/** Maximum scrollable distance; 0 on pages shorter than the viewport. */
	max: number;
}

type ScrollTask = (state: ScrollState) => void;

const scrollTasks: ScrollTask[] = [];
const resizeTasks: Array<() => void> = [];

let scrollFrame = 0;

function readState(): ScrollState {
	const doc = document.documentElement;
	return {
		y: window.scrollY || doc.scrollTop || 0,
		vh: window.innerHeight,
		max: Math.max(0, doc.scrollHeight - window.innerHeight),
	};
}

function runScrollTasks(): void {
	scrollFrame = 0;
	const state = readState();
	for (const task of scrollTasks) {
		try {
			task(state);
		} catch {
			// One misbehaving task must not stop the others.
		}
	}
}

function scheduleScroll(): void {
	if (scrollFrame) return;
	scrollFrame = requestAnimationFrame(runScrollTasks);
}

function onScroll(task: ScrollTask): void {
	scrollTasks.push(task);
}

function onResize(task: () => void): void {
	resizeTasks.push(task);
}

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

/* ------------------------------------------------------------------ chrome */

/** Reading indicator. A position readout, not an animation — it stays on under
 *  reduced motion. */
function initScrollProgress(): void {
	const bar = document.querySelector<HTMLElement>("[data-scroll-progress]");
	if (!bar) return;

	onScroll(({ y, max }) => {
		bar.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;
	});
}

/** Bottom conversion chrome. The sticky bar and the floating WhatsApp button
 *  are two primaries competing for the same corner, so they are driven by ONE
 *  threshold: past 80% of the first fold the bar takes over and the button
 *  retracts (translate + pointer-events:none, never a bare opacity — an
 *  invisible clickable button is worse than a visible one). */
function initBottomChrome(): void {
	const bar = document.querySelector<HTMLElement>("[data-sticky-cta]");
	const float = document.querySelector<HTMLElement>("[data-float-wa]");
	if (!bar && !float) return;

	let visible: boolean | null = null;

	onScroll(({ y, vh }) => {
		const next = y > vh * 0.8;
		if (next === visible) return;
		visible = next;
		bar?.classList.toggle("is-visible", next);
		float?.classList.toggle("is-retracted", next);
	});
}

/* --------------------------------------------------------------- countdown */

const pad = (value: number, size: number): string =>
	String(Math.max(0, value)).padStart(size, "0");

/** Live countdown to the immersion. Information, not decoration: it runs under
 *  reduced motion too. No `aria-live` — announcing a new value every second is
 *  noise; the `<dl>` carries an `aria-label` and is read on demand. */
function initCountdown(): void {
	const host = document.querySelector<HTMLElement>("[data-cd-target]");
	if (!host) return;

	const target = Date.parse(host.dataset.cdTarget ?? "");
	if (!Number.isFinite(target)) return;

	const units = Array.from(
		document.querySelectorAll<HTMLElement>("[data-cd]"),
	).map((el) => ({ el, key: el.dataset.cd ?? "" }));
	const minis = Array.from(
		document.querySelectorAll<HTMLElement>("[data-cd-mini]"),
	);
	if (!units.length && !minis.length) return;

	const tick = () => {
		const remaining = Math.max(0, target - Date.now());
		const totalSeconds = Math.floor(remaining / 1000);
		const days = Math.floor(totalSeconds / 86_400);
		const hours = Math.floor((totalSeconds % 86_400) / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		for (const { el, key } of units) {
			const next =
				key === "d"
					? pad(days, 3)
					: key === "h"
						? pad(hours, 2)
						: key === "m"
							? pad(minutes, 2)
							: key === "s"
								? pad(seconds, 2)
								: null;
			if (next !== null && el.textContent !== next) el.textContent = next;
		}

		const mini = `${pad(days, 3)}d ${pad(hours, 2)}h ${pad(minutes, 2)}m`;
		for (const el of minis) {
			if (el.textContent !== mini) el.textContent = mini;
		}
	};

	tick();
	window.setInterval(tick, 1000);
}

/* ------------------------------------------------------------------ counts */

function runCount(el: HTMLElement): void {
	const target = Number(el.dataset.count ?? "0");
	if (!Number.isFinite(target) || target <= 0) return;

	const localize = el.dataset.countFormat === "pt";
	const duration = 1100;
	const start = performance.now();

	const tick = (now: number) => {
		const progress = Math.min(1, (now - start) / duration);
		const eased = 1 - (1 - progress) ** 3;
		const value = Math.round(target * eased);
		el.textContent = localize ? value.toLocaleString("pt-BR") : String(value);
		if (progress < 1) requestAnimationFrame(tick);
	};

	requestAnimationFrame(tick);
}

function initCounters(): void {
	const counters = document.querySelectorAll<HTMLElement>("[data-count]");
	if (!counters.length || typeof IntersectionObserver === "undefined") return;

	try {
		const observer = new IntersectionObserver(
			(entries, obs) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					obs.unobserve(entry.target);
					runCount(entry.target as HTMLElement);
				}
			},
			{ rootMargin: "0px 0px -8% 0px", threshold: 0.2 },
		);
		for (const el of counters) observer.observe(el);
	} catch {
		// Figures stay at their server-rendered value.
	}
}

/* ---------------------------------------------------------------- parallax */

function initParallax(): void {
	const plates = Array.from(
		document.querySelectorAll<HTMLElement>("[data-parallax]"),
	);
	if (!plates.length) return;

	/** Offset currently written to each wrapper. getBoundingClientRect() reports
	 *  the *transformed* box, so feeding it straight back in makes the mapping
	 *  self-referential and the travel converges to speed/(1+speed) of what was
	 *  asked for. Subtracting the applied offset restores the untransformed
	 *  position and the requested speed. */
	const applied = new WeakMap<HTMLElement, number>();

	/** Per-element travel budget, recomputed on resize (offsetHeight and
	 *  clientHeight force layout, so this must not run per frame). */
	const budget = new WeakMap<HTMLElement, { slack: number; speed: number }>();

	const measure = () => {
		const viewport = window.innerHeight;

		for (const el of plates) {
			const host = el.parentElement;
			// Half the overscan: how far the wrapper can slide before it stops
			// covering the plate it fills.
			//
			// A decorative layer (a radial glow, say) has no plate to cover, so it
			// has no overscan to derive a budget from and would compute to zero.
			// `data-parallax-slack` lets such a layer declare its own travel in
			// pixels instead.
			const declared = Number(el.dataset.parallaxSlack ?? "");
			const slack =
				Number.isFinite(declared) && declared > 0
					? declared
					: host
						? Math.max(0, (el.offsetHeight - host.clientHeight) / 2)
						: 0;

			const asked = Number(el.dataset.speed ?? "0.14");

			// The overscan is a share of the PLATE height, but the travel scales
			// with the VIEWPORT. A strip only becomes visible while the offending
			// edge is on screen, which caps the demand at speed·(V − h)/2 — and
			// only when the wrapper is shorter than the fold. On a phone the 16/9
			// Boston plate is ~26% of the viewport, so the requested 0.12 needs
			// ~35px of slack against the ~22px it actually has. Damping the speed
			// (rather than clamping the offset) keeps the motion proportional
			// instead of freezing it at the limit.
			const demand = (Math.max(0, viewport - el.offsetHeight) / 2) * asked;
			const speed =
				demand > slack && demand > 0 ? asked * (slack / demand) : asked;

			budget.set(el, { slack, speed });
		}
	};

	onScroll(({ vh }) => {
		for (const el of plates) {
			const rect = el.getBoundingClientRect();
			if (rect.bottom < -200 || rect.top > vh + 200) continue;

			const { slack, speed } = budget.get(el) ?? { slack: 0, speed: 0 };
			const top = rect.top - (applied.get(el) ?? 0);
			const raw = (top + rect.height / 2 - vh / 2) * -speed;

			// Belt and braces: the damped speed already keeps the wrapper inside
			// its overscan for every on-screen position, but the clamp makes the
			// invariant unconditional for any future plate or aspect ratio.
			const offset = Math.max(-slack, Math.min(slack, raw));

			el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
			applied.set(el, offset);
		}
	});

	onResize(measure);
	measure();
}

/* -------------------------------------------------------------------- tilt */

function initTilt(): void {
	const finePointer =
		typeof window.matchMedia !== "function" ||
		window.matchMedia("(pointer: fine)").matches;
	if (!finePointer) return;

	for (const el of document.querySelectorAll<HTMLElement>("[data-tilt]")) {
		el.addEventListener("pointermove", (event) => {
			const rect = el.getBoundingClientRect();
			const px = (event.clientX - rect.left) / rect.width - 0.5;
			const py = (event.clientY - rect.top) / rect.height - 0.5;
			el.dataset.tiltActive = "";
			el.style.setProperty("--tilt-y", `${(px * 5).toFixed(2)}deg`);
			el.style.setProperty("--tilt-x", `${(-py * 5).toFixed(2)}deg`);
			el.style.setProperty("--tilt-lift", "-4px");
		});

		el.addEventListener("pointerleave", () => {
			el.removeAttribute("data-tilt-active");
			el.style.removeProperty("--tilt-x");
			el.style.removeProperty("--tilt-y");
			el.style.removeProperty("--tilt-lift");
		});
	}
}

/* ------------------------------------------------------------ load cascade */

/** Hero entrance. The initial state lives in the keyframes, not in CSS, and the
 *  animation fills backwards — so when this never runs the hero simply renders
 *  in its final state instead of staying at opacity 0. */
function initEnter(): void {
	const items = document.querySelectorAll<HTMLElement>("[data-enter]");
	if (!items.length || typeof Element.prototype.animate !== "function") return;

	for (const el of items) {
		const index = Number(el.dataset.enter ?? "0");
		if (!Number.isFinite(index)) continue;
		try {
			el.animate(
				[
					{ opacity: 0, transform: "translateY(26px)" },
					{ opacity: 1, transform: "translateY(0)" },
				],
				{
					duration: 700,
					delay: index * 60,
					easing: "cubic-bezier(0.16, 1, 0.3, 1)",
					fill: "backwards",
				},
			);
		} catch {
			// Element already renders in its final state.
		}
	}
}

/* ----------------------------------------------------------------- marquee */

/** Infinite ribbon. The children are duplicated once and the track translates
 *  by exactly -50%, so the seam never shows. Without JS (or under reduced
 *  motion) the list stays a wrapped flex row — the same items, no movement. */
function initMarquee(): void {
	for (const track of document.querySelectorAll<HTMLElement>(
		"[data-marquee]",
	)) {
		const originals = Array.from(track.children);
		if (!originals.length) continue;

		for (const child of originals) {
			const copy = child.cloneNode(true) as HTMLElement;
			copy.setAttribute("aria-hidden", "true");
			// The clone is created after the reveal observer has taken its census,
			// so it would never be observed and would sit at opacity 0 forever.
			// It is a duplicate of something already on screen: strip the reveal.
			copy.removeAttribute("data-reveal");
			for (const nested of copy.querySelectorAll("[data-reveal]")) {
				nested.removeAttribute("data-reveal");
			}
			track.appendChild(copy);
		}

		const duration = Number(track.dataset.marqueeDur ?? "30");
		track.style.animationDuration = `${Number.isFinite(duration) ? duration : 30}s`;
		track.classList.add("is-marquee");

		track.addEventListener("pointerenter", () => {
			track.style.animationPlayState = "paused";
		});
		track.addEventListener("pointerleave", () => {
			track.style.animationPlayState = "running";
		});
	}
}

/* ------------------------------------------------------------------- shine */

/** Sweep over a primary CTA. Injected rather than authored in markup so the
 *  span never reaches the accessibility tree of a button that has none. */
function initShine(): void {
	for (const el of document.querySelectorAll<HTMLElement>("[data-shine]")) {
		if (el.querySelector(":scope > .cta-shine")) continue;
		const sweep = document.createElement("span");
		sweep.className = "cta-shine";
		sweep.setAttribute("aria-hidden", "true");
		el.appendChild(sweep);
		el.classList.add("has-shine");
	}
}

/* --------------------------------------------------------------- hero fade */

function initHeroFade(): void {
	const hero = document.querySelector<HTMLElement>("[data-hero-fade]");
	if (!hero) return;

	onScroll(({ y, vh }) => {
		const progress = clamp01(y / (vh * 0.9));
		hero.style.opacity = String(1 - progress * 0.9);
		hero.style.transform = `translate3d(0, ${(progress * 46).toFixed(1)}px, 0)`;
	});
}

/* ---------------------------------------------------- horizontal pinned rail */

/** Boston agenda. Above 900px the section is taller than the viewport and its
 *  viewport child sticks while the track translates horizontally — the rail
 *  reads as one continuous move instead of four stacked cards. Below that (or
 *  under reduced motion) it degrades to a snap carousel, which is the same
 *  content with a native interaction.
 *
 *  The pin height is written to the wrapper, never to the sticky child: growing
 *  the wrapper reserves the scroll distance up front, so nothing shifts when the
 *  rail engages (CLS 0). */
function initHorizontalPin(): void {
	const pins = Array.from(
		document.querySelectorAll<HTMLElement>("[data-hpin]"),
	);
	if (!pins.length) return;

	interface Pin {
		root: HTMLElement;
		viewport: HTMLElement;
		track: HTMLElement;
		bar: HTMLElement | null;
		overflow: number;
		active: boolean;
	}

	const entries: Pin[] = [];

	for (const root of pins) {
		const viewport = root.querySelector<HTMLElement>("[data-hpin-vp]");
		const track = root.querySelector<HTMLElement>("[data-hpin-track]");
		if (!viewport || !track) continue;
		entries.push({
			root,
			viewport,
			track,
			bar: root.querySelector<HTMLElement>("[data-hpin-bar]"),
			overflow: 0,
			active: false,
		});
	}
	if (!entries.length) return;

	const layout = () => {
		const enabled = window.innerWidth >= 900;

		for (const pin of entries) {
			if (!enabled) {
				pin.active = false;
				pin.root.classList.remove("is-pinned");
				pin.root.style.removeProperty("height");
				pin.track.style.removeProperty("transform");
				if (pin.bar) pin.bar.style.width = "100%";
				continue;
			}

			pin.root.classList.add("is-pinned");
			// Measure with the track at rest, otherwise the previous transform
			// leaks into scrollWidth on a resize.
			pin.track.style.transform = "translate3d(0, 0, 0)";
			pin.overflow = Math.max(
				0,
				pin.track.scrollWidth - pin.viewport.clientWidth + 24,
			);
			pin.root.style.height = `${pin.viewport.clientHeight + pin.overflow}px`;
			pin.active = pin.overflow > 0;
			if (!pin.active) {
				pin.root.style.removeProperty("height");
				pin.root.classList.remove("is-pinned");
			}
		}
	};

	onScroll(() => {
		for (const pin of entries) {
			if (!pin.active) continue;
			const progress = clamp01(
				-pin.root.getBoundingClientRect().top / pin.overflow,
			);
			pin.track.style.transform = `translate3d(${(-progress * pin.overflow).toFixed(1)}px, 0, 0)`;
			if (pin.bar) pin.bar.style.width = `${(progress * 100).toFixed(1)}%`;
		}
	});

	onResize(layout);
	layout();
}

/* -------------------------------------------------------------------- boot */

export function initMotion(): void {
	const reduceMotion =
		typeof window.matchMedia === "function" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	// Chrome that carries information runs in every mode.
	initScrollProgress();
	initBottomChrome();
	initCountdown();

	if (!reduceMotion) {
		initCounters();
		initParallax();
		initTilt();
		initEnter();
		initMarquee();
		initShine();
		initHeroFade();
		initHorizontalPin();
	}

	window.addEventListener("scroll", scheduleScroll, { passive: true });
	window.addEventListener(
		"resize",
		() => {
			for (const task of resizeTasks) {
				try {
					task();
				} catch {
					// Keep the remaining layouts alive.
				}
			}
			scheduleScroll();
		},
		{ passive: true },
	);

	runScrollTasks();
}
