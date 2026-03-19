<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { CategoryNode } from '$lib/components/category-node';
	import CategoryTreeItem from '$lib/components/CategoryTreeItem.svelte';
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import MaterialCard from '$lib/components/MaterialCard.svelte';
	import MentionViewer from '$lib/components/MentionViewer.svelte';
	import { tesisApi } from '$lib/api';
	import { materialViewSync } from '$lib/stores/material-view-sync';
	import type { Bookmark, Material } from '$lib/type';
	import IntroCloud from '$lib/intro/IntroCloud.svelte';
	import IntroDonam from '$lib/intro/IntroDonam.svelte';
	import IntroLegacy from '$lib/intro/IntroLegacy.svelte';
	import IntroSocialstory from '$lib/intro/IntroSocialstory.svelte';
	import IntroSupport from '$lib/intro/IntroSupport.svelte';

	export let projectCode: 'legacy' | 'support' | 'socialstory' | 'cloud' | 'donam';

	const introMap = {
		legacy: IntroLegacy,
		support: IntroSupport,
		socialstory: IntroSocialstory,
		cloud: IntroCloud,
		donam: IntroDonam
	} as const;

	const titleMap = {
		legacy: '레거시',
		support: '지원자료',
		socialstory: '그림으로 배우는 학교',
		cloud: '곳간',
		donam: '돈암초'
	} as const;

	const apiBase = import.meta.env.VITE_API_BASE ?? '';
	let sidebarOpen = false;
	let sidebarRoot: CategoryNode | null = null;
	let recentMaterials: Material[] = [];
	let materials: Material[] = [];
	let bookmarks: Bookmark[] = [];
	let materialsSubtitle = '';
	let showDefault = true;
	let mentionOpen = false;
	let mentionMaterialSeq: number | null = null;
	let activeCategorySeq: number | null = null;

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

	const updateColLayout = () => {
		const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('col-class') : null;
		const colClass = saved || 'col-4';
		const targets = document.querySelectorAll(
			'.tab-content .row > .col-section, .recent-materials .col-section'
		);
		targets.forEach((el) => {
			colClasses.forEach((c) => el.classList.remove(c));
			el.classList.add(colClass);
		});
	};

	const initCarousel = () => {
		const jq = (
			window as typeof window & {
				$?: (sel: string) => { carousel: (opt: { interval: boolean }) => void };
			}
		).$;
		if (jq) {
			jq('.carousel').carousel({ interval: false });
		}
	};

	const loadSidebarData = async (targetCode: string) => {
		const projectSeq = await getProjectSeqFor(targetCode);
		if (!projectSeq) return;

		const cateData = await tesisApi.getProjectCategory(projectSeq, { baseUrl: apiBase });
		const rootSeq = cateData?.cate?.seq;
		if (!rootSeq) return;

		const data = await tesisApi.getCategoryWithRecent(rootSeq, projectSeq, { baseUrl: apiBase });
		sidebarRoot = data?.cate ?? null;

		recentMaterials = data?.materials ?? [];
		materials = [];
		bookmarks = [];
		materialsSubtitle = '';
		showDefault = true;
		activeCategorySeq = null;
		await tick();
		updateColLayout();
		initCarousel();
	};

	const getProjectSeqFor = async (targetCode: string) => {
		if (typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem('projects');
			if (stored) {
				try {
					const parsed = JSON.parse(stored) as { projectCode?: string; seq?: number }[];
					const matched = parsed.find((prj) => prj.projectCode === targetCode);
					if (matched?.seq) return matched.seq;
				} catch {
					// ignore
				}
			}
		}
		const res = await tesisApi.getProjectPage(targetCode, { baseUrl: apiBase });
		return res?.projectSeq ?? null;
	};

	const loadMaterials = async (cateSeq: number) => {
		const res = await tesisApi.getMaterialsByCate(cateSeq, { baseUrl: apiBase });
		if (!res?.success) return;

		activeCategorySeq = cateSeq;
		materials = res.materials ?? [];
		bookmarks = res.bookmarks ?? [];
		materialsSubtitle = materials[0]?.category?.categoryName ?? '';
		showDefault = false;
		await tick();
		updateColLayout();
		initCarousel();
		const disposer = (window as typeof window & { tesis?: { search?: { dispose?: () => void } } })
			?.tesis?.search?.dispose;
		disposer?.();
		sidebarOpen = false;
	};

	const handleOpenComments = (materialSeq: number) => {
		mentionMaterialSeq = materialSeq;
		mentionOpen = true;
	};

	const handleNavigateProject = (targetCode: string) => {
		loadSidebarData(targetCode);
		sidebarOpen = false;
	};

	onMount(() => {
		(window as typeof window & { ctxpath?: string }).ctxpath = apiBase;
		loadSidebarData(projectCode);

		const unsubscribe = materialViewSync.subscribe((payload) => {
			if (payload.version === 0) {
				return;
			}
			if (activeCategorySeq == null) {
				return;
			}
			if (payload.cateSeq != null && payload.cateSeq !== activeCategorySeq) {
				return;
			}
			void loadMaterials(activeCategorySeq);
		});

		return unsubscribe;
	});
</script>

<svelte:head>
	<title>{titleMap[projectCode]}</title>
	<link rel="stylesheet" href="/css/pages/community.css" />
	<link rel="stylesheet" href="/css/pages/side.css" />
	<script src="/js/tesis.js"></script>
	<script src="/js/community/material-renderer.js"></script>
</svelte:head>

<div class="container-fluid">
	<Header
		projectCode={projectCode}
		{apiBase}
		on:toggleSidebar={() => (sidebarOpen = !sidebarOpen)}
		on:navigateProject={(event) => handleNavigateProject(event.detail.projectCode)}
	/>
	<Sidebar
		open={sidebarOpen}
		label={sidebarRoot?.categoryName ?? '지원자료'}
		onClose={() => (sidebarOpen = false)}
	>
		{#if sidebarRoot}
			<ul class="list-unstyled components mb-5">
				{#each sidebarRoot.sub ?? [] as item (item.seq)}
					<CategoryTreeItem node={item} onSelect={loadMaterials} />
				{/each}
			</ul>
		{/if}
	</Sidebar>
	<div id="support-wrapper" class="list-group">
		{#if showDefault}
			<div class="default-main-page">
				<svelte:component this={introMap[projectCode]} {apiBase}>
					<div slot="recent">
						{#if recentMaterials.length > 0}
							<div class="tab-pane fade active show">
								<div class="album bg-light">
									<h4 class="carousel-title">최근 자료</h4>
									<div>
										<div class="row">
											{#each recentMaterials as material (material.seq)}
												<MaterialCard
													{material}
													on:openComments={(event) => handleOpenComments(event.detail.materialSeq)}
												/>
											{/each}
										</div>
									</div>
								</div>
							</div>
						{/if}
					</div>
				</svelte:component>
			</div>
		{:else}
			<div class="tab-content">
				<div class="tab-pane fade active show">
					<div class="album bg-light">
						{#if materialsSubtitle}
							<h4 class="carousel-title">{materialsSubtitle}</h4>
						{/if}
						<div>
							<div class="row">
								{#each materials as material (material.seq)}
									<MaterialCard
										{material}
										{bookmarks}
										on:openComments={(event) => handleOpenComments(event.detail.materialSeq)}
									/>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<MentionViewer bind:open={mentionOpen} materialSeq={mentionMaterialSeq} />
