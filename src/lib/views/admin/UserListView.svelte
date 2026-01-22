<script lang="ts">
	import type { UserSummary } from './admin-types';

	export let users: UserSummary[] = [];
	export let loadingTeams = false;
</script>

{#if loadingTeams}
	<span>...</span>
{:else}
	{#each users as user}
		<a
			class="user"
			href="#"
			draggable="true"
			data-user={user.seq}
			on:click|preventDefault
			on:dragstart={(event) => event.dataTransfer?.setData('user', String(user.seq))}
		>
			<span class="uname">{user.userName}({user.userId})</span>
			<span class="email">{user.userEmail}</span>
		</a>
	{/each}
{/if}

<style lang="scss">
	.user {
		display: block;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		padding: 0.25rem;
		margin-bottom: 0.5rem;
		span.uname {
			display: block;
			font-size: 1.25em;
			font-weight: bold;
		}
	}
</style>
