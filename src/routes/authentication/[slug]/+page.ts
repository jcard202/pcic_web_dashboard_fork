// src/routes/authentication/[slug]/+page.ts
import type { LoadEvent } from '@sveltejs/kit';

export async function load({ params }: LoadEvent) {
	const post = await import(`../${params.slug}.svelte`);
	// const { title, dir } = post.metadata;
	const content = post.default;

	return {
		content
		// title,
		// dir
	};
}
