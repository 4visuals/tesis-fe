<script lang="ts">
	import { createEventDispatcher, onDestroy } from 'svelte';

	type ThumbnailItem = { src: string; order: number };

	export let open = false;
	export let images: ThumbnailItem[] = [];

	const dispatch = createEventDispatcher<{
		select: { order: number };
		close: void;
	}>();

	let scrollY = 0;

	$: if (typeof window !== 'undefined') {
		if (open) {
			scrollY = window.scrollY;
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
			window.scroll(0, scrollY);
		}
	}

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			document.body.style.overflow = 'auto';
		}
	});

	const handleOverlayClick = (event: MouseEvent) => {
		const target = event.target as HTMLElement;
		if (target.tagName === 'IMG') {
			const order = Number((target as HTMLImageElement).dataset.order ?? 0);
			dispatch('select', { order });
			return;
		}
		dispatch('close');
	};
</script>

{#if open}
	<div class="view-all-img" on:click={handleOverlayClick}>
		<div class="img-holder">
			{#each images as img (img.order)}
				<img src={img.src} data-order={img.order} />
			{/each}
		</div>
	</div>
{/if}

<style lang="scss">
	$overlay-bg: #cccccc75;
	$holder-bg: #736d6de0;
	$accent: #007bff;

	.view-all-img {
		position: fixed;
		top: 80px;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: $overlay-bg;
		z-index: 1500;
		display: block;
		overflow: auto;

		> .img-holder {
			width: 90%;
			margin: auto;
			background-color: $overlay-bg;
			background-color: $holder-bg;

			> img {
				width: 22%;
				margin: 1em;
				outline: $accent 2px;
			}
		}
	}
</style>
