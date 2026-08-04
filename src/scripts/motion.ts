/**
 * Shared pointer/scroll motion runtime for the landing.
 *
 * Three opt-in behaviours, all additive to markup that is already complete
 * without JS:
 *   [data-count]    — counts up to the final figure once the element scrolls in.
 *                     The element already renders that figure server-side, so
 *                     nothing is lost when the script never runs.
 *   [data-parallax] — translates a plate wrapper against scroll. The wrapper's
 *                     `transform` is otherwise unused (stability.md triage:
 *                     "parallax salta" when it shares the property with layout).
 *   [data-tilt]     — writes --tilt-x/--tilt-y/--tilt-lift; the transform itself
 *                     lives in CSS so tilt and hover-lift never fight.
 *
 * Everything bails out under `prefers-reduced-motion: reduce`; tilt
 * additionally requires a fine pointer, so touch never gets a phantom tilt.
 */

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

function initParallax(): void {
	const plates = Array.from(
		document.querySelectorAll<HTMLElement>("[data-parallax]"),
	);
	if (!plates.length) return;

	let frame = 0;

	const paint = () => {
		frame = 0;
		const viewport = window.innerHeight;
		for (const el of plates) {
			const rect = el.getBoundingClientRect();
			if (rect.bottom < -200 || rect.top > viewport + 200) continue;
			const speed = Number(el.dataset.speed ?? "0.14");
			const offset = (rect.top + rect.height / 2 - viewport / 2) * -speed;
			el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
		}
	};

	const schedule = () => {
		if (frame) return;
		frame = requestAnimationFrame(paint);
	};

	window.addEventListener("scroll", schedule, { passive: true });
	window.addEventListener("resize", schedule, { passive: true });
	paint();
}

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

export function initMotion(): void {
	const reduceMotion =
		typeof window.matchMedia === "function" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (reduceMotion) return;

	initCounters();
	initParallax();
	initTilt();
}
