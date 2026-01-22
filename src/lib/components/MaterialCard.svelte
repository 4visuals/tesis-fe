<script lang="ts">
	import type { Bookmark, Material } from '$lib/type';
	import { createEventDispatcher } from 'svelte';
	import ThumbnailView from '$lib/components/ThumbnailView.svelte';
	import { tesisApi } from '$lib/api';

	export let material: Material;
	export let bookmarks: Bookmark[] = [];

	const dispatch = createEventDispatcher<{ openComments: { materialSeq: number } }>();

	const storageBase = 'https://kr.object.ncloudstorage.com/tesis';
	const apiBase = import.meta.env.VITE_API_BASE ?? '';
	let showAll = false;
	let bookmarkActive = false;
	let lastBookmarkKey = '';
	let lastMaterialSeq: number | null = null;

	const isImage = (name: string) => /\.(jpg|jpeg|png|gif)$/i.test(name);

	const getExt = (name: string) => {
		const idx = name.lastIndexOf('.');
		return idx >= 0 ? name.substring(idx + 1).toLowerCase() : '';
	};

	const colorMap: Record<string, string> = {
		pdf: 'btn-danger',
		hwp: 'btn-primary',
		ppt: 'btn-success',
		pptx: 'btn-success',
		etc: 'btn-warning'
	};

	const extToColor = (ext: string) => colorMap[ext] ?? colorMap.etc;

	const parseVideoId = (path: string) => {
		const idx = path.lastIndexOf('/');
		return idx >= 0 ? path.substring(idx + 1) : path;
	};

	$: imageFiles = material.thumnails.filter((thum) => isImage(thum.originFileName));
	$: pdfThumbnails = material.thumnails.filter((thum) => !isImage(thum.originFileName));
	$: sortedThumbnails = [...imageFiles, ...pdfThumbnails];
	$: isVideo =
		material.thumnails.length === 0 &&
		material.contents.length === 1 &&
		material.contents[0].type === 'VIDEO';
	$: isBookmarked = bookmarks.some((bmk) => bmk.materialSeq === material.seq);
	$: {
		const key = bookmarks.map((bmk) => bmk.materialSeq).join(',');
		if (lastMaterialSeq !== material.seq || key !== lastBookmarkKey) {
			bookmarkActive = isBookmarked;
			lastMaterialSeq = material.seq;
			lastBookmarkKey = key;
		}
	}
	$: carouselId = `crs-${material.seq}`;
	$: viewAllImages = sortedThumbnails.map((thumb, idx) => ({
		src: `${storageBase}/${thumb.generatedPath}`,
		order: idx
	}));

	const goToSlide = (order: number) => {
		const jq = (window as typeof window & { $?: (sel: string) => { carousel: (idx: number) => void } }).$;
		if (jq) {
			jq(`#${carouselId}`).carousel(order);
		}
	};

	const printImage = (event: MouseEvent) => {
		event.preventDefault();
		const target = event.currentTarget as HTMLElement;
		const carousel = target.closest('.carousel.slide');
		const activeImg = carousel?.querySelector<HTMLImageElement>(
			'.carousel-inner .carousel-item.active img'
		);
		if (!activeImg) return;
		const url = `${apiBase}/support/print/img?target=${encodeURIComponent(activeImg.src)}`;
		window.open(url, '_blank');
	};

	const toggleBookmark = async (event: MouseEvent) => {
		event.preventDefault();
		try {
			const res = await tesisApi.toggleBookmark(material.seq, { baseUrl: apiBase });
			if (res?.success) {
				bookmarkActive = res.bookmarked;
			}
		} catch (error) {
			console.error(error);
		}
	};

	const openComments = (event: MouseEvent) => {
		event.preventDefault();
		dispatch('openComments', { materialSeq: material.seq });
	};
</script>

{#if isVideo}
	<div class="col-12 col-section">
		<div class="card mb-4 box-shadow" data-mseq={material.seq}>
			<div class="floating-r-button">
				<a href="#" class={bookmarkActive ? 'active bookmark' : 'normal bookmark'} on:click={toggleBookmark}>
					<span class="material-icons">star</span>
				</a>
			</div>
			<div>
				<iframe
					class="video-material"
					width="100%"
					src={`https://www.youtube.com/embed/${parseVideoId(material.contents[0].generatedPath)}?rel=0?controls=1`}
					frameborder="0"
					allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>
			<div class="card-block px-6">
				<h5 class="card-title">{material.title}</h5>
				<div class="owner-info">
					<span class="owner badge badge-info">{material.owner?.userName} 선생님</span>
					<span class="cate badge badge-dark">{material.category?.categoryName}</span>
					<a href="#" class="comment" on:click={openComments}>
						<span class="material-icons">comment</span>
						<span class="mention-cnt">{material.mentionCnt && material.mentionCnt > 0 ? material.mentionCnt : ''}</span>
					</a>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div class="col-12 col-section">
		<div class="card mb-4 box-shadow" data-mseq={material.seq}>
			<div>
				<div id={carouselId} class="carousel slide" data-ride="carousel">
					<div class="floating-r-button">
						<a
							href="#"
							class={bookmarkActive ? 'active bookmark' : 'normal bookmark'}
							on:click={toggleBookmark}
						>
							<span class="material-icons">star</span>
						</a>
						<a href="#" class="material-icons view-img" on:click={printImage}>open_in_new</a>
					</div>
					<a href="#" class="view-all material-icons" on:click|preventDefault={() => (showAll = true)}>
						apps
					</a>
					<ol class="carousel-indicators">
						{#each sortedThumbnails as thumb, idx}
							<li data-target={`#${carouselId}`} data-slide-to={idx} class={idx === 0 ? 'active' : ''}></li>
						{/each}
					</ol>
					<div class="carousel-inner">
						{#each sortedThumbnails as thumb, idx}
							<div class={`carousel-item ${idx === 0 ? 'active' : ''}`}>
								<img src={`${storageBase}/${thumb.generatedPath}`} class="d-block w-100" />
							</div>
						{/each}
					</div>
					<a class="control carousel-control-prev" href={`#${carouselId}`} role="button" data-slide="prev">
						<span class="" aria-hidden="true"></span>
						<span class="sr-only">Previous</span>
					</a>
					<a class="control carousel-control-next" href={`#${carouselId}`} role="button" data-slide="next">
						<span class="" aria-hidden="true"></span>
						<span class="sr-only">Next</span>
					</a>
				</div>
			</div>
			<div class="card-block px-6">
				<h5 class="card-title">{material.title}</h5>
				<div class="fileGroup">
					{#if material.contents.length === 0}
						<a class="btn btn-light mr-2 hide-it" href="#">파일없음</a>
					{:else}
						{#each material.contents as file (file.generatedPath)}
							{#if file.type !== 'VIDEO'}
								<a
									target="_blank"
									rel="noreferrer"
									class={`btn ${extToColor(getExt(file.originFileName))} mr-2`}
									title={file.originFileName}
									href={`${storageBase}/${file.generatedPath}`}
								>
									{getExt(file.originFileName)}
								</a>
							{/if}
						{/each}
					{/if}
				</div>
				<div class="owner-info">
					<span class="owner badge badge-info">{material.owner?.userName} 선생님</span>
					<span class="cate badge badge-dark" title={material.category?.fullPath}>
						{material.category?.categoryName}
					</span>
					<a href="#" class="comment" on:click={openComments}>
						<span class="material-icons">comment</span>
						<span class="mention-cnt">{material.mentionCnt && material.mentionCnt > 0 ? material.mentionCnt : ''}</span>
					</a>
				</div>
			</div>
		</div>
	</div>
	<ThumbnailView
		open={showAll}
		images={viewAllImages}
		on:select={(event) => {
			goToSlide(event.detail.order);
			showAll = false;
		}}
		on:close={() => (showAll = false)}
	/>
{/if}
