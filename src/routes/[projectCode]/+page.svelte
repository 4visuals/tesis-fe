<script lang="ts">
	import MaterialView from '$lib/views/MaterialView.svelte';

	export let data: { projectCode: 'legacy' | 'support' | 'socialstory' | 'cloud' | 'donam' };
</script>

<MaterialView projectCode={data.projectCode} />
