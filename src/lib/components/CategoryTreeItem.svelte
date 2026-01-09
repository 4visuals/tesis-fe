<script lang="ts">
	import type { CategoryNode } from './category-node';

	export let node: CategoryNode;
	export let onSelect: (cateSeq: number) => void;

	let open = false;

	const hasSub = () => Array.isArray(node.sub) && node.sub.length > 0;
	const isEmpty = () => !hasSub() && (node.items ?? 0) <= 0;

	const handleClick = (event: MouseEvent) => {
		event.preventDefault();
		if (hasSub()) {
			open = !open;
			return;
		}
		if (isEmpty()) return;
		onSelect(node.seq);
	};
</script>

<li>
	<a
		href={hasSub() ? `#seq${node.seq}` : '#'}
		class={`${hasSub() ? 'dropdown-toggle' : 'dropdown-item'} ${isEmpty() ? 'collapsed empty-item' : ''}`}
		data-cate={node.seq}
		on:click={handleClick}
	>
		{node.categoryName}
	</a>
	{#if hasSub()}
		<ul class={`list-unstyled collapse ${open ? 'show' : ''}`} id={`seq${node.seq}`}>
			{#each node.sub ?? [] as child (child.seq)}
				<svelte:self node={child} {onSelect} />
			{/each}
		</ul>
	{/if}
</li>
