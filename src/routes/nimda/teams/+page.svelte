<script lang="ts">
	import TeamListView from '$lib/views/admin/TeamListView.svelte';

	export let data;
	console.log('[teamlistview]', data);
</script>

<TeamListView
	teams={data.teams}
	users={data.users}
	loadError={data.loadError}
	loadingTeams={data.loadingTeams}
/>
