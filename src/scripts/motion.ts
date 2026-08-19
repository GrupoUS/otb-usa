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

/** Chrome tasks (progress bar, header, bottom bar) live for the page. */
const chromeScrollTasks: ScrollTask[] = [];
const chromeResizeTasks: Array<() => void> = [];

/** Decorative tasks are torn down and rebuilt whenever the user flips
 *  `prefers-reduced-motion` mid-session, so they register on their own channel:
 *  the tasks are dropped, the listeners aborted and the inline styles undone. */
const decorScrollTasks: ScrollTask[] = [];
const decorResizeTasks: Array<() => void> = [];

let decorController: AbortController | null = null;
const decorCleanups: Array<() => void> = [];

/** Every listener a decorative behaviour opens carries this signal, so a single
 *  `abort()` removes all of them at once. */
function decorSignal(): AbortSignal | undefined {
	return decorController?.signal;
}

function onDecorCleanup(undo: () => void): void {
	decorCleanups.push(undo);
}

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
	for (const task of [...chromeScrollTasks, ...decorScrollTasks]) {
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

function onScroll(
	task: ScrollTask,
	channel: "chrome" | "decor" = "decor",
): void {
	(channel === "chrome" ? chromeScrollTasks : decorScrollTasks).push(task);
}

function onResize(
	task: () => void,
	channel: "chrome" | "decor" = "decor",
): void {
	(channel === "chrome" ? chromeResizeTasks : decorResizeTasks).push(task);
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
	}, "chrome");
}

/** Header shell. Transparent over the hero, solid once the reader has moved.
 *
 *  This used to be an IntersectionObserver on a 1px sentinel at the very top of
 *  the page, with `rootMargin: -56px` — which shrinks the root past the sentinel,
 *  so it never intersected and the header was solid from the first frame. The
 *  visible cost was the header CTA (gated on `.is-solid`) sharing the fold with
 *  the hero CTA. A threshold on the scroll position says what was meant. */
function initHeader(): void {
	const header = document.querySelector<HTMLElement>("[data-header]");
	if (!header) return;

	let solid: boolean | null = null;

	onScroll(({ y }) => {
		const next = y > 40;
		if (next === solid) return;
		solid = next;
		header.classList.toggle("is-solid", next);
	}, "chrome");
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
	}, "chrome");
}

/* --------------------------------------------------------------- countdown */

const pad = (value: number, size: number): string =>
	String(Math.max(0, value)).padStart(size, "0");

/** Live countdown to the immersion. Information, not decoration: it runs under
 *  reduced motion too. No `aria-live` — announcing a new value every second is
 *  noise; the `<dl>` carries an `aria-label` and is read on demand. */
function initCountdown(): void {
	const hosts = Array.from(
		document.querySelectorAll<HTMLElement>("[data-cd-target]"),
	);
	if (!hosts.length) return;

	/* The target is read per wrapper, not once for the page: the hero, the price
	   card and the sticky bar each declare their own `data-cd-target`, and today
	   they happen to agree. Resolving through `closest()` means a second date
	   (a lote deadline, say) is a markup change and not a silent bug where every
	   digit on the page counts to the first date found. */
	const resolve = (el: HTMLElement): number => {
		const host = el.closest<HTMLElement>("[data-cd-target]") ?? hosts[0];
		const parsed = Date.parse(host?.dataset.cdTarget ?? "");
		return Number.isFinite(parsed) ? parsed : Number.NaN;
	};

	const units = Array.from(document.querySelectorAll<HTMLElement>("[data-cd]"))
		.map((el) => ({ el, key: el.dataset.cd ?? "", target: resolve(el) }))
		.filter((unit) => Number.isFinite(unit.target));
	const minis = Array.from(
		document.querySelectorAll<HTMLElement>("[data-cd-mini]"),
	)
		.map((el) => ({ el, target: resolve(el) }))
		.filter((unit) => Number.isFinite(unit.target));
	if (!units.length && !minis.length) return;

	const split = (target: number) => {
		const totalSeconds = Math.floor(Math.max(0, target - Date.now()) / 1000);
		return {
			days: Math.floor(totalSeconds / 86_400),
			hours: Math.floor((totalSeconds % 86_400) / 3600),
			minutes: Math.floor((totalSeconds % 3600) / 60),
			seconds: totalSeconds % 60,
		};
	};

	const tick = () => {
		for (const { el, key, target } of units) {
			const { days, hours, minutes, seconds } = split(target);
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

		for (const { el, target } of minis) {
			const { days, hours, minutes } = split(target);
			const mini = `${pad(days, 3)}d ${pad(hours, 2)}h ${pad(minutes, 2)}m`;
			if (el.textContent !== mini) el.textContent = mini;
		}
	};

	tick();
	const timer = window.setInterval(tick, 1000);
	// A page kept alive in the back/forward cache would otherwise go on ticking.
	window.addEventListener("pagehide", () => window.clearInterval(timer), {
		once: true,
	});
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

/** A figure counts up once per page life. Without this a reduced-motion toggle
 *  would replay every counter that is on screen at that moment. */
const counted = new WeakSet<HTMLElement>();

function initCounters(): void {
	const counters = Array.from(
		document.querySelectorAll<HTMLElement>("[data-count]"),
	).filter((el) => !counted.has(el));
	if (!counters.length || typeof IntersectionObserver === "undefined") return;

	try {
		const observer = new IntersectionObserver(
			(entries, obs) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					obs.unobserve(entry.target);
					const el = entry.target as HTMLElement;
					counted.add(el);
					runCount(el);
				}
			},
			{ rootMargin: "0px 0px -8% 0px", threshold: 0.2 },
		);
		for (const el of counters) observer.observe(el);
		onDecorCleanup(() => observer.disconnect());
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

	/* Scratch buffer for the read pass, reused every frame so the scroll loop
	   allocates nothing. */
	const pending: Array<{ el: HTMLElement; offset: number }> = [];

	onScroll(({ vh }) => {
		/* Read pass. A style write between two rect reads invalidates layout,
		   so an interleaved loop forces a synchronous reflow for every element
		   after the first — nine of them, every frame, while scrolling. */
		pending.length = 0;

		for (const el of plates) {
			const rect = el.getBoundingClientRect();
			if (rect.bottom < -200 || rect.top > vh + 200) continue;

			const { slack, speed } = budget.get(el) ?? { slack: 0, speed: 0 };
			const top = rect.top - (applied.get(el) ?? 0);
			const raw = (top + rect.height / 2 - vh / 2) * -speed;

			// Belt and braces: the damped speed already keeps the wrapper inside
			// its overscan for every on-screen position, but the clamp makes the
			// invariant unconditional for any future plate or aspect ratio.
			pending.push({ el, offset: Math.max(-slack, Math.min(slack, raw)) });
		}

		/* Write pass. */
		for (const { el, offset } of pending) {
			el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
			applied.set(el, offset);
		}
	});

	onResize(measure);
	measure();

	onDecorCleanup(() => {
		for (const el of plates) {
			el.style.removeProperty("transform");
			applied.delete(el);
		}
	});
}

/* -------------------------------------------------------------------- tilt */

function initTilt(): void {
	const finePointer =
		typeof window.matchMedia !== "function" ||
		window.matchMedia("(pointer: fine)").matches;
	if (!finePointer) return;

	const signal = decorSignal();
	const cards = Array.from(
		document.querySelectorAll<HTMLElement>("[data-tilt]"),
	);
	if (!cards.length) return;

	const rest = (el: HTMLElement) => {
		el.removeAttribute("data-tilt-active");
		el.style.removeProperty("--tilt-x");
		el.style.removeProperty("--tilt-y");
		el.style.removeProperty("--tilt-lift");
	};

	for (const el of cards) {
		// `pointermove` fires far more often than the screen refreshes. Keeping
		// only the latest position and writing it inside one frame turns a burst
		// of style invalidations into a single one.
		let pending: { x: number; y: number } | null = null;
		let frame = 0;

		const write = () => {
			frame = 0;
			if (!pending) return;
			const { x, y } = pending;
			pending = null;
			el.dataset.tiltActive = "";
			el.style.setProperty("--tilt-y", `${(x * 5).toFixed(2)}deg`);
			el.style.setProperty("--tilt-x", `${(-y * 5).toFixed(2)}deg`);
			el.style.setProperty("--tilt-lift", "-4px");
		};

		el.addEventListener(
			"pointermove",
			(event) => {
				const rect = el.getBoundingClientRect();
				pending = {
					x: (event.clientX - rect.left) / rect.width - 0.5,
					y: (event.clientY - rect.top) / rect.height - 0.5,
				};
				if (!frame) frame = requestAnimationFrame(write);
			},
			{ signal },
		);

		// `pointerleave` alone leaves the card stuck when the pointer is captured
		// elsewhere, the gesture is cancelled or the window loses focus.
		for (const event of ["pointerleave", "pointercancel", "blur"] as const) {
			el.addEventListener(
				event,
				() => {
					pending = null;
					if (frame) {
						cancelAnimationFrame(frame);
						frame = 0;
					}
					rest(el);
				},
				{ signal },
			);
		}
	}

	onDecorCleanup(() => {
		for (const el of cards) rest(el);
	});
}

/* ------------------------------------------------------------ load cascade */

/** Hero entrance.
 *
 *  Transform only — deliberately no opacity. The hero's lede is the LCP element
 *  on a phone, and an element held at `opacity: 0` is not painted, so fading the
 *  fold in pushes LCP out by the length of the cascade. Sliding it in costs
 *  nothing: the text is painted at full strength from the first frame and the
 *  choreography still reads.
 *
 *  It also means there is no pre-state to undo: if this module never runs, the
 *  fold is already in its final position. */
let enterPlayed = false;

function initEnter(): void {
	// The cascade belongs to the page load. Re-running it because the reader
	// turned motion back on halfway down would animate a fold nobody is looking
	// at.
	if (enterPlayed) return;
	const items = document.querySelectorAll<HTMLElement>("[data-enter]");
	if (!items.length || typeof Element.prototype.animate !== "function") return;
	enterPlayed = true;

	for (const el of items) {
		const index = Number(el.dataset.enter ?? "0");
		if (!Number.isFinite(index)) continue;
		try {
			el.animate(
				[{ transform: "translateY(26px)" }, { transform: "translateY(0)" }],
				{
					duration: 700,
					delay: index * 60,
					easing: "cubic-bezier(0.16, 1, 0.3, 1)",
					fill: "backwards",
				},
			);
		} catch {
			// The element is already where it belongs; it simply does not animate.
		}
	}
}

/* ----------------------------------------------------------------- marquee */

/** Infinite ribbon. The children are duplicated once and the track translates by
 *  half its width plus half a gap, which is where the seamless period actually
 *  falls on a doubled track. Without JS (or under reduced motion) the list stays
 *  a wrapped flex row — the same items, no movement.
 *
 *  WCAG 2.2.2: content that moves automatically for more than five seconds needs
 *  a mechanism to stop it, and hover is not one for a keyboard or a touch
 *  reader. The runtime injects a real button, labelled from the content layer.
 *  No labels declared means no control, and no control means no animation. */
function initMarquee(): void {
	for (const track of document.querySelectorAll<HTMLElement>(
		"[data-marquee]",
	)) {
		const originals = Array.from(track.children);
		if (!originals.length) continue;

		// The control is authored in the component (so it can use the project's
		// icon set) and stays `hidden` until here: without this runtime there is
		// no animation for it to pause. No control, no animation.
		const control = track.parentElement?.querySelector<HTMLButtonElement>(
			"[data-marquee-toggle]",
		);
		const pauseLabel = control?.dataset.labelPause ?? "";
		const resumeLabel = control?.dataset.labelResume ?? "";
		if (!control || !pauseLabel || !resumeLabel) continue;

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

		const clones = Array.from(track.children).slice(originals.length);
		onDecorCleanup(() => {
			for (const clone of clones) clone.remove();
			track.classList.remove("is-marquee");
			track.style.removeProperty("animation-duration");
			track.style.removeProperty("animation-play-state");
			// No animation left to stop: the control would be a dead button.
			control.hidden = true;
		});

		let paused = false;
		const setPlayState = () => {
			track.style.animationPlayState = paused ? "paused" : "running";
		};

		const pauseIcon = control.querySelector<HTMLElement>("[data-icon-pause]");
		const playIcon = control.querySelector<HTMLElement>("[data-icon-play]");

		control.hidden = false;
		control.addEventListener(
			"click",
			() => {
				paused = !paused;
				control.setAttribute("aria-pressed", String(paused));
				control.setAttribute("aria-label", paused ? resumeLabel : pauseLabel);
				pauseIcon?.classList.toggle("hidden", paused);
				pauseIcon?.classList.toggle("inline-flex", !paused);
				playIcon?.classList.toggle("hidden", !paused);
				playIcon?.classList.toggle("inline-flex", paused);
				setPlayState();
			},
			{ signal: decorSignal() },
		);

		// Hover is a convenience on top of the control, never the mechanism.
		track.addEventListener(
			"pointerenter",
			() => {
				if (!paused) track.style.animationPlayState = "paused";
			},
			{ signal: decorSignal() },
		);
		track.addEventListener("pointerleave", setPlayState, {
			signal: decorSignal(),
		});
	}
}

/* ------------------------------------------------------------------- shine */

/** Sweep over a primary CTA. Injected rather than authored in markup so the
 *  span never reaches the accessibility tree of a button that has none. */
function initShine(): void {
	const sweeps: Array<{ host: HTMLElement; sweep: HTMLElement }> = [];

	for (const el of document.querySelectorAll<HTMLElement>("[data-shine]")) {
		if (el.querySelector(":scope > .cta-shine")) continue;
		const sweep = document.createElement("span");
		sweep.className = "cta-shine";
		sweep.setAttribute("aria-hidden", "true");
		el.appendChild(sweep);
		el.classList.add("has-shine");
		sweeps.push({ host: el, sweep });
	}

	onDecorCleanup(() => {
		for (const { host, sweep } of sweeps) {
			sweep.remove();
			host.classList.remove("has-shine");
		}
	});
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

	onDecorCleanup(() => {
		hero.style.removeProperty("opacity");
		hero.style.removeProperty("transform");
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
		/** The CSS `top` the viewport sticks at. Progress is measured against it,
		 *  not against 0, or the rail starts travelling before it is pinned. */
		stickyTop: number;
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
			stickyTop: 0,
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
			pin.stickyTop = Number.parseFloat(
				window.getComputedStyle(pin.viewport).top,
			);
			if (!Number.isFinite(pin.stickyTop)) pin.stickyTop = 0;
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

	/* Same read-then-write split as the parallax loop: `pin.bar` animates
	   `width`, which is a layout write, so a rect read after it would reflow. */
	const pinPending: Array<{ pin: (typeof entries)[number]; progress: number }> =
		[];

	onScroll(() => {
		pinPending.length = 0;

		for (const pin of entries) {
			if (!pin.active) continue;
			const progress = clamp01(
				(pin.stickyTop - pin.root.getBoundingClientRect().top) / pin.overflow,
			);
			pinPending.push({ pin, progress });
		}

		for (const { pin, progress } of pinPending) {
			pin.track.style.transform = `translate3d(${(-progress * pin.overflow).toFixed(1)}px, 0, 0)`;
			if (pin.bar) pin.bar.style.width = `${(progress * 100).toFixed(1)}%`;
		}
	});

	/* While pinned the viewport is `overflow: hidden` — which still makes it a
	   scroll container. Anything that scrolls it sideways (the browser revealing
	   a focused control in an off-screen panel, a trackpad swipe, find-in-page)
	   adds an offset the runtime cannot see, and the rail ends up wedged: its
	   transform says one thing and the box says another.

	   Rather than fight it, translate it. Any horizontal scroll of the box is
	   converted into the equivalent page scroll and the box is put back to zero,
	   so the rail keeps a single source of truth and the focused panel still
	   ends up on screen. */
	const signal = decorSignal();

	for (const pin of entries) {
		pin.viewport.addEventListener(
			"scroll",
			() => {
				if (!pin.active || !pin.overflow) return;
				const left = pin.viewport.scrollLeft;
				if (!left) return;

				pin.viewport.scrollLeft = 0;
				const rect = pin.root.getBoundingClientRect();
				const rootTop = rect.top + window.scrollY;
				const current = clamp01((pin.stickyTop - rect.top) / pin.overflow);
				const next = clamp01(current + left / pin.overflow);
				window.scrollTo(
					0,
					Math.round(rootTop - pin.stickyTop + next * pin.overflow),
				);
				// Through the rAF gate, like every other scroll-driven write —
				// calling the tasks straight from the event runs them outside the
				// frame the browser was going to paint anyway.
				scheduleScroll();
			},
			{ passive: true, signal },
		);

		/* Chrome does not always scroll the clipped box: when the rail is still
		   off-screen it scrolls the PAGE to the panel's static position instead,
		   which lands on progress 0 with the focused panel still clipped. So the
		   intent is read directly — move the page to the progress that reveals
		   the panel the focus landed in. */
		pin.viewport.addEventListener(
			"focusin",
			(event) => {
				if (!pin.active || !pin.overflow) return;

				const target = event.target as HTMLElement | null;
				const panel = target?.closest<HTMLElement>("[data-hpin-track] > *");
				if (!panel) return;

				requestAnimationFrame(() => {
					if (pin.viewport.scrollLeft) pin.viewport.scrollLeft = 0;

					const reveal = clamp01(
						(panel.offsetLeft + panel.offsetWidth - pin.viewport.clientWidth) /
							pin.overflow,
					);
					const rect = pin.root.getBoundingClientRect();
					const rootTop = rect.top + window.scrollY;
					window.scrollTo(
						0,
						Math.round(rootTop - pin.stickyTop + reveal * pin.overflow),
					);
					scheduleScroll();
				});
			},
			{ signal },
		);
	}

	onResize(layout);
	layout();

	onDecorCleanup(() => {
		for (const pin of entries) {
			pin.active = false;
			pin.root.classList.remove("is-pinned");
			pin.root.style.removeProperty("height");
			pin.track.style.removeProperty("transform");
			// The rail is now a carousel: its progress bar has nothing left to
			// report, so it reads as complete rather than as stuck at zero.
			if (pin.bar) pin.bar.style.width = "100%";
		}
	});
}

/* -------------------------------------------------------------------- boot */

/** Decorative behaviours, as one session that can be opened and closed. */
function startDecorative(): void {
	if (decorController) return;
	decorController = new AbortController();

	// The cascade still runs FIRST, but no longer because anything depends on it
	// to become visible: `[data-enter]` animates transform only and the fold is
	// painted at full opacity on the first frame (that is what took LCP from 6.7s
	// to 2.0s). Order kept so the entrance reads as one choreography rather than
	// starting mid-way through the other effects.
	for (const init of [
		initEnter,
		initCounters,
		initParallax,
		initTilt,
		initMarquee,
		initShine,
		initHeroFade,
		initHorizontalPin,
	]) {
		try {
			init();
		} catch {
			// Never take the page down for an effect.
		}
	}

	scheduleScroll();
}

/** Closing the session drops the decorative tasks, aborts every listener they
 *  opened and undoes the inline styles they wrote, so what remains is the
 *  static page: a wrapped ribbon, a snap carousel, plates at rest. */
function stopDecorative(): void {
	if (!decorController) return;
	decorController.abort();
	decorController = null;
	decorScrollTasks.length = 0;
	decorResizeTasks.length = 0;

	for (const undo of decorCleanups.splice(0)) {
		try {
			undo();
		} catch {
			// A failed undo must not block the rest of the teardown.
		}
	}
}

export function initMotion(): void {
	const query =
		typeof window.matchMedia === "function"
			? window.matchMedia("(prefers-reduced-motion: reduce)")
			: null;

	// Chrome that carries information runs in every mode. Each behaviour is
	// isolated: one of them failing must not silence the rest.
	for (const init of [
		initScrollProgress,
		initHeader,
		initBottomChrome,
		initCountdown,
	]) {
		try {
			init();
		} catch {
			// Enhancement only — the markup underneath is already complete.
		}
	}

	if (!query?.matches) startDecorative();

	/* The preference is not a boot-time constant. Reading it once meant a reader
	   who turns motion off (or back on) from the OS kept the old behaviour until
	   a reload — which is exactly the moment the setting matters most. */
	const sync = () => {
		if (query?.matches) stopDecorative();
		else startDecorative();
	};
	query?.addEventListener("change", sync);

	let resizeFrame = 0;
	const remeasure = () => {
		resizeFrame = 0;
		for (const task of [...chromeResizeTasks, ...decorResizeTasks]) {
			try {
				task();
			} catch {
				// Keep the remaining layouts alive.
			}
		}
		scheduleScroll();
	};
	// `resize` fires in bursts while a window is dragged, and every task in here
	// forces layout. One remeasure per frame is all the screen can show.
	const scheduleResize = () => {
		if (resizeFrame) return;
		resizeFrame = requestAnimationFrame(remeasure);
	};

	window.addEventListener("scroll", scheduleScroll, { passive: true });
	window.addEventListener("resize", scheduleResize, { passive: true });
	// Late-loading images and webfonts change the measurements the parallax
	// budget and the pinned rail were computed from.
	window.addEventListener("load", scheduleResize, { once: true });

	runScrollTasks();
}
