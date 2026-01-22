<script lang="ts">
	import { page } from '$app/stores';
	import CateTree from './CateTree.svelte';
	import TeamCardView from './TeamCardView.svelte';
	import UserListView from './UserListView.svelte';

	import type { CategoryNode, Team, UserSummary } from './admin-types';

	type MemberResponse = {
		success: boolean;
		member?: UserSummary;
	};

	type CateHierarchyResponse = {
		success?: boolean;
		cate?: CategoryNode;
	};

	type CateUpdateResponse = {
		success: boolean;
		cates?: CategoryNode[];
	};

	const baseUrl = import.meta.env.VITE_API_BASE ?? '';
	const buildUrl = (path: string) => `${baseUrl}${path}`;

	const isSuccess = (value: { success?: boolean }) => value.success !== false;

	const requestJson = async <T,>(path: string, init?: RequestInit): Promise<T> => {
		const response = await fetch(buildUrl(path), {
			credentials: 'include',
			headers: {
				Accept: 'application/json; charset=utf-8'
			},
			...init
		});
		if (!response.ok) {
			throw new Error(`Request failed: ${response.status}`);
		}
		return response.json() as Promise<T>;
	};

	$: path = $page.url.pathname;
	$: lastSegment = path.split('/').filter(Boolean).pop() ?? '';
	const isActive = (id: string): boolean => id === lastSegment;

	export let teams: Team[] = [];
	export let users: UserSummary[] = [];
	export let loadingTeams = false;
	export let loadError = '';

	let cateViewerOpen = false;
	let cateViewerRoot: CategoryNode | null = null;
	let cateViewerTeamSeq: number | null = null;
	let cateViewerLoading = false;
	let cateViewerError = '';

	const updateTeam = (teamSeq: number, updater: (team: Team) => Team) => {
		teams = teams.map((team) => (team.seq === teamSeq ? updater(team) : team));
	};

	const registerMember = async (userSeq: number, teamSeq: number) => {
		const res = await requestJson<MemberResponse>(`/team/${teamSeq}/member/${userSeq}`, {
			method: 'POST'
		});
		if (res.success && res.member) {
			updateTeam(teamSeq, (team) => ({
				...team,
				members: [...team.members, res.member as UserSummary]
			}));
			return;
		}
		alert('이미 존재합니다');
	};

	const removeMember = async (teamSeq: number, userSeq: number) => {
		const res = await requestJson<{ success: boolean }>(`/team/${teamSeq}/member/${userSeq}`, {
			method: 'DELETE'
		});
		if (res.success) {
			updateTeam(teamSeq, (team) => ({
				...team,
				members: team.members.filter((member) => member.seq !== userSeq)
			}));
			return;
		}
		alert('멤버 삭제 실패');
	};

	const attachCategory = async (teamSeq: number, cateSeq: number) => {
		const res = await requestJson<{ success: boolean }>(`/admin/team/${teamSeq}/cate/${cateSeq}`, {
			method: 'POST'
		});
		if (!res.success) {
			alert('카테고리 추가 실패');
		}
		return res.success;
	};

	const detachCategory = async (teamSeq: number, cateSeq: number) => {
		const res = await requestJson<CateUpdateResponse>(`/admin/team/${teamSeq}/cate/${cateSeq}`, {
			method: 'DELETE'
		});
		if (res.success) {
			updateTeam(teamSeq, (team) => ({
				...team,
				workingCategories:
					res.cates ?? team.workingCategories.filter((cate) => cate.seq !== cateSeq)
			}));
			return;
		}
		alert('카테고리 삭제 실패');
	};

	const setSelectable = (cate: CategoryNode, selectable: boolean) => {
		cate.selectable = selectable;
		if (cate.sub && cate.sub.length > 0) {
			cate.sub.forEach((sub) => setSelectable(sub, selectable));
		}
	};

	const findCate = (cate: CategoryNode, seq: number): CategoryNode | null => {
		if (cate.seq === seq) {
			return cate;
		}
		if (!cate.sub) {
			return null;
		}
		for (const child of cate.sub) {
			const found = findCate(child, seq);
			if (found) {
				return found;
			}
		}
		return null;
	};

	const refreshCateViewer = () => {
		if (cateViewerRoot) {
			cateViewerRoot = { ...cateViewerRoot };
		}
	};

	const openCateViewer = async (team: Team) => {
		if (!team.project.category) {
			cateViewerError = '카테고리를 불러올 수 없습니다.';
			cateViewerOpen = true;
			return;
		}
		cateViewerOpen = true;
		cateViewerTeamSeq = team.seq;
		cateViewerLoading = true;
		cateViewerError = '';
		try {
			const res = await requestJson<CateHierarchyResponse>(
				`/manager/category/${team.project.category.seq}`
			);
			const root = res.cate ?? (res as unknown as CategoryNode);
			if (!root || !isSuccess(res)) {
				throw new Error('카테고리를 불러오지 못했습니다.');
			}
			setSelectable(root, true);
			team.workingCategories.forEach((cate) => {
				const target = findCate(root, cate.seq);
				if (target) {
					setSelectable(target, false);
				}
			});
			cateViewerRoot = root;
		} catch (error) {
			cateViewerError = error instanceof Error ? error.message : '카테고리를 불러오지 못했습니다.';
		} finally {
			cateViewerLoading = false;
		}
	};

	const closeCateViewer = () => {
		cateViewerOpen = false;
		cateViewerRoot = null;
		cateViewerTeamSeq = null;
		cateViewerError = '';
	};

	const handleCateSelect = async (cate: CategoryNode) => {
		if (!cateViewerTeamSeq || !cateViewerRoot) {
			return;
		}
		if (cate.selectable === false) {
			return;
		}
		const success = await attachCategory(cateViewerTeamSeq, cate.seq);
		if (!success) {
			return;
		}
		updateTeam(cateViewerTeamSeq, (team) => ({
			...team,
			workingCategories: [...team.workingCategories, cate]
		}));
		setSelectable(cate, false);
		refreshCateViewer();
	};

	const handleUserDrop = async (event: DragEvent, teamSeq: number) => {
		event.preventDefault();
		const userSeqText = event.dataTransfer?.getData('user');
		if (!userSeqText) {
			return;
		}
		const userSeq = Number.parseInt(userSeqText, 10);
		if (Number.isNaN(userSeq)) {
			return;
		}
		await registerMember(userSeq, teamSeq);
	};
</script>

<svelte:head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
	<script>
		var ctxpath = '';
	</script>
	<script
		src="https://code.jquery.com/jquery-3.4.1.js"
		integrity="sha256-WpOohJOqMqqyKL9FccASB9O0KwACQJpFTUBLTYOVvVU="
		crossorigin="anonymous"
	></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
	<script type="text/javascript" src="/js/bootstrap.js"></script>
	<script src="https://kit.fontawesome.com/ee2ae3520a.js"></script>
	<link href="/css/bootstrap.css" rel="stylesheet" />
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
	<link href="/css/common.css" rel="stylesheet" />
	<title>TESIS 관리자</title>
</svelte:head>

<header style="height: 50px">
	<nav class="navbar navbar-expand-sm navbar-light bg-light fixed-top">
		<a class="navbar-brand" href="/nimda">TESIS</a>
		<button
			class="navbar-toggler"
			type="button"
			data-toggle="collapse"
			data-target="#navbar-body"
			aria-controls="navbar-body"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>
		<div class="collapse navbar-collapse" id="navbar-body">
			<ul class="navbar-nav mr-auto">
				<li class="nav-item" id="projects">
					<a class="nav-link" class:active={isActive('projects')} href="/nimda/projects">프로젝트</a
					>
				</li>
				<li class="nav-item" id="teams">
					<a class="nav-link" class:active={isActive('teams')} href="/nimda/teams">팀</a>
				</li>
				<li class="nav-item" id="userlist">
					<a class="nav-link" class:active={isActive('userlist')} href="/nimda/userlist">회원</a>
				</li>
			</ul>
			<a>LOGOUT</a>
		</div>
	</nav>
</header>
<div class="container-fluid">
	<div class="row">
		<div class="col-12">
			<div class="row">
				<div class="col-3" id="user-wrapper">
					<UserListView {users} {loadingTeams} />
				</div>
				<div class="col-9" id="team-wrapper">
					<div class="container-fluid">
						<div class="row">
							{#if loadError}
								<span>{loadError}</span>
							{/if}
							{#each teams as team}
								<TeamCardView
									{team}
									onDropUser={handleUserDrop}
									onRemoveMember={removeMember}
									onOpenCateViewer={openCateViewer}
									onDetachCategory={detachCategory}
								/>
							{/each}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

{#if cateViewerOpen}
	<div id="cate-wrapper">
		<a class="close" href="#" on:click|preventDefault={closeCateViewer}
			><span class="material-icons f5x">close</span></a
		>
		<div class="cate-holder">
			{#if cateViewerLoading}
				<span>...</span>
			{:else if cateViewerError}
				<span>{cateViewerError}</span>
			{:else if cateViewerRoot}
				<CateTree cate={cateViewerRoot} onSelect={handleCateSelect} />
			{/if}
		</div>
	</div>
{/if}

<style lang="scss">
	#user-wrapper {
		max-height: calc(100vh - 140px);
		overflow-y: auto;
	}

	#team-wrapper,
	#tream-wrapper {
		max-height: calc(100vh - 140px);
		overflow-y: auto;
	}
</style>
