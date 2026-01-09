<script lang="ts">
	export let open = false;
	export let label = '지원자료';
	export let onClose: (() => void) | null = null;
</script>

<div id="sidebar" style={`width: ${open ? '300px' : '0'}`}>
	<a
		href="#"
		class="closebtn"
		on:click|preventDefault={() => {
			onClose?.();
		}}
	>
		×
	</a>
	<div id="sidebar-wrapper" class="list-group">
		{#if label}
			<label class="sidebar-title">{label}</label>
		{/if}
		<slot />
	</div>
</div>
