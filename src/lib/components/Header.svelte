<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	type ProjectLink = { projectName: string; projectCode: string };

	export let projectCode: string;
	export let apiBase = '';
	export let projects: ProjectLink[] = [];

	let navProjects: ProjectLink[] = projects;
	let userLabel = '';
	let uploadVisible = false;
	let projectSeq: number | null = null;
	let colLayout = 'col-4';
	const dispatch = createEventDispatcher<{ toggleSidebar: void }>();

	const colClasses = [
		'col-2',
		'col-3',
		'col-4',
		'col-6',
		'col-12',
		'col-sm-12',
		'col-md-6',
		'col-lg-6',
		'col-xs-4'
	];

	const loadColLayout = () => {
		if (typeof localStorage === 'undefined') return;
		const saved = localStorage.getItem('col-class');
		if (saved) colLayout = saved;
	};

	const saveColLayout = (value: string) => {
		if (typeof localStorage === 'undefined') return;
		localStorage.setItem('col-class', value);
	};

	const updateColLayout = (value: string) => {
		const targets = document.querySelectorAll(
			'.tab-content .row > .col-section, .recent-materials .col-section'
		);
		targets.forEach((el) => {
			colClasses.forEach((c) => el.classList.remove(c));
			el.classList.add(value);
		});
	};

	const handleColLayoutChange = (event: Event) => {
		const value = (event.currentTarget as HTMLSelectElement).value;
		saveColLayout(value);
		updateColLayout(value);
	};

	const checkUploadRole = async () => {
		try {
			const response = await fetch(`${apiBase}/projectPage/${projectCode}`, {
				credentials: 'include'
			});
			if (!response.ok) return;
			const res = await response.json();
			if (res?.user) userLabel = `${res.user} 선생님`;
			if (res?.success) {
				uploadVisible = true;
				projectSeq = res.projectSeq ?? null;
			} else {
				uploadVisible = false;
				projectSeq = null;
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleUpload = async () => {
		if (!projectSeq) {
			await checkUploadRole();
		}
		if (projectSeq) {
			window.open(`${apiBase}/project/${projectSeq}`);
		} else {
			alert('권한이 없습니다');
		}
	};

	onMount(() => {
		if (!navProjects.length && typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem('projects');
			if (stored) {
				try {
					navProjects = JSON.parse(stored) as ProjectLink[];
				} catch {
					navProjects = projects;
				}
			}
		}
		loadColLayout();
		updateColLayout(colLayout);
		checkUploadRole();
	});
</script>

<header id="head-wrapper">
	<nav id="header-navbar" class="navbar navbar-expand-md navbar-dark bg-dark">
		<span
			id="opensidebar"
			class="material-icons md-light mr-2"
			on:click={() => dispatch('toggleSidebar')}
			role="button"
			aria-label="Open sidebar"
		>
			view_list
		</span>
		<a class="navbar-brand" href="#" aria-disabled="true">서.경.인.</a>

		<button
			class="navbar-toggler"
			type="button"
			data-toggle="collapse"
			data-target="#navbarSupportedContent"
			aria-controls="navbarSupportedContent"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon"></span>
		</button>

		<div class="collapse navbar-collapse" id="navbarSupportedContent">
			<ul class="navbar-nav mr-auto">
				{#each navProjects as prj (prj.projectCode)}
					<li class="nav-item">
						<a
							class="nav-link"
							href={`/${prj.projectCode}`}
							class:active={prj.projectCode === projectCode}
						>
							{prj.projectName}
						</a>
					</li>
				{/each}
				<li class="nav-item">
					<a class="nav-link" href={`${apiBase}/mypage`}>MyPage</a>
				</li>
			</ul>
			<button data-open-search class="btn" type="button">
				<span class="material-icons md-light">search</span>
			</button>
			<form class="form-inline my-2">
				<select
					id="col-layout"
					class="form-control mr-3"
					bind:value={colLayout}
					on:change={handleColLayoutChange}
				>
					<option value="col-12">1열</option>
					<option value="col-6">2열</option>
					<option value="col-4">3열</option>
					<option value="col-3">4열</option>
					<option value="col-2">6열</option>
				</select>
				<button
					type="button"
					id="uploadBtn"
					class="btn btn-outline-success my-2 my-sm-0 mr-3"
					class:hide-it={!uploadVisible}
					on:click|preventDefault={handleUpload}
				>
					자료올리기
				</button>
				<div class="dropdown">
					<button
						id="userLabel"
						type="button"
						class="btn btn-outline-success dropdown-toggle dropdown-toggle-split mr-3"
						data-toggle="dropdown"
					>
						{userLabel}
					</button>
					<div class="dropdown-menu">
						<a
							id="updatePass"
							class="dropdown-item"
							data-toggle="modal"
							data-target="#updatePassModal"
						>
							비밀번호 변경
						</a>
						<a
							id="updateUserData"
							class="dropdown-item disabled"
							href="#"
							data-toggle="modal"
							data-target="#updateUserModal"
						>
							회원정보변경
						</a>
					</div>
				</div>
				<a id="logOutBtn" class="btn btn-outline-danger my-2 my-sm-0" href={`${apiBase}/logout`}>
					로그아웃
				</a>
			</form>
		</div>
	</nav>
</header>
<div class="header-pad" style="height: 70px;"></div>
