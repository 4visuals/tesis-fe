<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { CategoryNode } from '$lib/components/category-node';
	import CategoryTreeItem from '$lib/components/CategoryTreeItem.svelte';
	import Header from '$lib/components/Header.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import IntroCloud from '$lib/intro/IntroCloud.svelte';
	import IntroDonam from '$lib/intro/IntroDonam.svelte';
	import IntroLegacy from '$lib/intro/IntroLegacy.svelte';
	import IntroSocialstory from '$lib/intro/IntroSocialstory.svelte';
	import IntroSupport from '$lib/intro/IntroSupport.svelte';

	export let data: { projectCode: 'legacy' | 'support' | 'socialstory' | 'cloud' | 'donam' };

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
	let recentHtml = '';
	let materialsHtml = '';
	let showDefault = true;

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

	const setRecentTitle = () => {
		document.querySelectorAll('.recent-materials .carousel-title').forEach((el) => {
			el.textContent = '최근 자료';
		});
	};

	const getProjectSeq = async () => {
		if (typeof localStorage !== 'undefined') {
			const stored = localStorage.getItem('projects');
			if (stored) {
				try {
					const parsed = JSON.parse(stored) as { projectCode?: string; seq?: number }[];
					const matched = parsed.find((prj) => prj.projectCode === data.projectCode);
					if (matched?.seq) return matched.seq;
				} catch {
					// ignore
				}
			}
		}
		const response = await fetch(`${apiBase}/projectPage/${data.projectCode}`, {
			credentials: 'include'
		});
		if (!response.ok) return null;
		const res = await response.json();
		return res?.projectSeq ?? null;
	};

	const loadSidebarData = async () => {
		const projectSeq = await getProjectSeq();
		if (!projectSeq) return;

		const cateRes = await fetch(`${apiBase}/manager/${projectSeq}/category`, {
			credentials: 'include'
		});
		if (!cateRes.ok) return;
		const cateData = await cateRes.json();
		const rootSeq = cateData?.cate?.seq;
		if (!rootSeq) return;

		const res = await fetch(`${apiBase}/manager/category/${rootSeq}/project/${projectSeq}`, {
			credentials: 'include'
		});
		if (!res.ok) return;
		const data = await res.json();
		sidebarRoot = data?.cate ?? null;

		const renderer = (
			window as typeof window & { tesis?: { material?: { render?: (m: unknown) => string } } }
		)?.tesis?.material?.render;
		recentHtml = renderer ? renderer(data?.materials ?? []) : '';
		await tick();
		setRecentTitle();
		updateColLayout();
		initCarousel();
	};

	const loadMaterials = async (cateSeq: number) => {
		const response = await fetch(`${apiBase}/materials/cate/${cateSeq}`, {
			credentials: 'include'
		});
		if (!response.ok) return;
		const res = await response.json();
		if (!res?.success) return;

		const renderer = (
			window as typeof window & {
				tesis?: { material?: { render?: (m: unknown, b?: unknown) => string } };
			}
		)?.tesis?.material?.render;
		materialsHtml = renderer ? renderer(res.materials ?? [], res.bookmarks ?? []) : '';
		showDefault = false;
		await tick();
		updateColLayout();
		initCarousel();
		const disposer = (window as typeof window & { tesis?: { search?: { dispose?: () => void } } })
			?.tesis?.search?.dispose;
		disposer?.();
		sidebarOpen = false;
	};

	onMount(() => {
		(window as typeof window & { ctxpath?: string }).ctxpath = apiBase;
		loadSidebarData();
	});
</script>

<svelte:head>
	<title>{titleMap[data.projectCode]}</title>
	<link rel="stylesheet" href="/css/pages/community.css" />
	<link rel="stylesheet" href="/css/pages/side.css" />
	<script src="/js/tesis.js"></script>
	<script src="/js/community/material-renderer.js"></script>
</svelte:head>

<div class="container-fluid">
	<Header
		projectCode={data.projectCode}
		{apiBase}
		on:toggleSidebar={() => (sidebarOpen = !sidebarOpen)}
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
				<svelte:component this={introMap[data.projectCode]} {apiBase} {recentHtml} />
			</div>
		{:else}
			<div class="tab-content">{@html materialsHtml}</div>
		{/if}
	</div>
</div>
