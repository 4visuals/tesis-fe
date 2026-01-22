<script lang="ts">
	import type { Team } from './admin-types';

	export let team: Team;
	export let onDropUser: (event: DragEvent, teamSeq: number) => void;
	export let onRemoveMember: (teamSeq: number, userSeq: number) => void;
	export let onOpenCateViewer: (team: Team) => void | Promise<void>;
	export let onDetachCategory: (teamSeq: number, cateSeq: number) => void;
</script>

<div
	class="segment team-elem col-sm-12 col-md-6"
	data-teamseq={team.seq}
	on:dragover|preventDefault
	on:drop={(event) => onDropUser(event, team.seq)}
>
	<h3>{team.teamName}</h3>
	<div class="content">
		<div class="form-group">
			<h4>프로젝트</h4>
			<input type="hidden" value={team.project.seq} />
			<input type="text" value={team.project.projectName} class="form-control" readonly />
		</div>
		<div class="form-group">
			<h4>팀원({team.members.length}명)</h4>
			<div class="members">
				{#if team.members.length === 0}
					<span>없음</span>
				{:else}
					{#each team.members as member}
						<a
							href="#"
							class="user aslabel"
							data-user={member.seq}
							on:click|preventDefault={() => onRemoveMember(team.seq, member.seq)}
						>
							{member.userName}({member.userId})
							<span class="material-icons">cancel</span>
						</a>
					{/each}
				{/if}
			</div>
		</div>
		<div class="form-group">
			<h4>작업 카테고리</h4>
			<button
				class="btn-cate btn btn-primary btn-sm"
				type="button"
				data-rootCate={team.project.category?.seq ?? ''}
				on:click={() => onOpenCateViewer(team)}
			>
				카테고리추가
			</button>
			<div>
				{#if team.workingCategories.length === 0}
					<span>없음</span>
				{:else}
					{#each team.workingCategories as cate}
						<a
							href="#"
							class="cate aslabel"
							data-cate={cate.seq}
							on:click|preventDefault={() => onDetachCategory(team.seq, cate.seq)}
						>
							{cate.categoryName}
							<span class="material-icons">cancel</span>
						</a>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.segment {
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		padding: 1rem;
		box-shadow: 1px 1px 1px #cccccc87;
		margin: 0.75rem 0;
	}

	.members {
		/* border: 1px solid #ccc; */
		background-color: #eee;
		border-radius: 0.5rem;
		padding: 1rem;
	}

	a.user,
	a.cate {
		display: block;
		border: 1px solid #ccc;
		border-radius: 0.5rem;
		padding: 0.25rem;
		margin-bottom: 0.5rem;
	}

	a.user.aslabel,
	a.cate.aslabel {
		display: inline-block;
		margin-right: 0.5rem;
		margin-bottom: 0.5rem;
		background-color: #fff;
		display: inline-flex;
		align-items: center;
	}

	a.aslabel .material-icons {
		font-size: 1rem;
	}
</style>
