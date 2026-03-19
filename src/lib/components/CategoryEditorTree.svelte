<script lang="ts">
	import type { Category } from '$lib/type';

	export let node: Category;
	export let selectedSeq: number | null = null;
	export let onSelect: (node: Category) => void;

	let expanded = (node.level ?? 0) === 0;

	const hasChildren = (category: Category) => (category.sub?.length ?? 0) > 0;
</script>

<li class="tree-item">
	<div class="tree-row" class:selected={selectedSeq === node.seq}>
		<button
			type="button"
			class="tree-toggle"
			class:placeholder={!hasChildren(node)}
			on:click={() => (expanded = !expanded)}
		>
			{#if hasChildren(node)}
				<span class="material-icons">{expanded ? 'expand_more' : 'chevron_right'}</span>
			{/if}
		</button>
		<button
			type="button"
			class="tree-label"
			class:selectable={node.selectable !== false}
			class:locked={node.selectable === false}
			on:click={() => onSelect(node)}
		>
			<span>{node.categoryName}</span>
			{#if (node.sub?.length ?? 0) > 0}
				<small>({node.sub?.length})</small>
			{/if}
		</button>
	</div>

	{#if expanded && hasChildren(node)}
		<ul class="tree-children">
			{#each node.sub ?? [] as child (child.seq)}
				<svelte:self {onSelect} node={child} {selectedSeq} />
			{/each}
		</ul>
	{/if}
</li>

<style lang="scss">
	.tree-item {
		list-style: none;
	}

	.tree-row {
		display: grid;
		grid-template-columns: 28px minmax(0, 1fr);
		align-items: center;
		border-radius: 12px;
		transition: background-color 120ms ease;

		&.selected {
			background: rgba(14, 116, 144, 0.12);
		}
	}

	.tree-toggle,
	.tree-label {
		border: 0;
		background: transparent;
	}

	.tree-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		color: #475569;
		cursor: pointer;

		&.placeholder {
			cursor: default;
		}
	}

	.tree-label {
		display: flex;
		gap: 6px;
		align-items: center;
		min-width: 0;
		padding: 8px 10px;
		border-radius: 12px;
		color: #0f172a;
		text-align: left;
		cursor: pointer;

		span {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		small {
			color: #64748b;
		}

		&.locked {
			color: #94a3b8;
		}

		&.selectable:hover {
			background: rgba(14, 116, 144, 0.08);
		}
	}

	.tree-children {
		margin: 4px 0 0 18px;
		padding: 0 0 0 8px;
		border-left: 1px dashed rgba(148, 163, 184, 0.6);
	}
</style>
