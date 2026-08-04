/**
 * Content-path → ImageMetadata resolver.
 *
 * The content layer stores plain string paths (`/images/otb/gallery/aula-1.jpg`)
 * because JSON cannot hold an `ImageMetadata` object. Astro's optimizer, on the
 * other hand, only works with imported assets. This maps one to the other so the
 * copy stays in `otb.json` while the bytes go through `astro:assets` (AVIF/WebP,
 * srcset, intrinsic dimensions → CLS 0).
 *
 * Add an image: drop it in `src/assets/images/otb/**` and reference it from the
 * JSON with its `/images/otb/**` path. Nothing else to wire.
 */
import type { ImageMetadata } from "astro";

const modules = import.meta.glob<ImageMetadata>(
	"/src/assets/images/otb/**/*.{jpg,jpeg,png,webp,avif}",
	{ eager: true, import: "default" },
);

const ASSET_PREFIX = "/src/assets/images/otb";
const CONTENT_PREFIX = "/images/otb";

const byContentPath = new Map<string, ImageMetadata>(
	Object.entries(modules).map(([modulePath, image]) => [
		modulePath.replace(ASSET_PREFIX, CONTENT_PREFIX),
		image,
	]),
);

/**
 * Resolves a content-layer image path. Throws at build time on a miss so a
 * typo in the JSON fails the build instead of shipping a broken image.
 */
export function resolveImage(contentPath: string): ImageMetadata {
	const image = byContentPath.get(contentPath);
	if (!image) {
		throw new Error(
			`Image not found for content path "${contentPath}". Expected a file under src/assets/images/otb mirroring that path. Known paths: ${[...byContentPath.keys()].join(", ")}`,
		);
	}
	return image;
}
