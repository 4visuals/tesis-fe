<script lang="ts">
	import { onMount } from 'svelte';
	import CategoryEditorTree from '$lib/components/CategoryEditorTree.svelte';
	import MaterialCardEditor from '$lib/components/MaterialCardEditor.svelte';
	import { modalContext } from '$lib/components/modal';
	import { tesisApi } from '$lib/api';
	import { materialViewSync } from '$lib/stores/material-view-sync';
	import type { Category, ContentFile, Material, Team, Thumbnail } from '$lib/type';

	export let projectSeq: number;
	export let projectCode = '';
	export let apiBase = '';

	type EditorCategory = Category & {
		sub?: EditorCategory[];
	};

	type EditorMaterial = Material & {
		category: EditorCategory;
		thumnails: Thumbnail[];
		contents: ContentFile[];
	};

	type UploadDraft = {
		id: number;
		material: EditorMaterial;
		thumbnailFiles: File[];
		contentFiles: File[];
	};

	type TabKey = 'files' | 'videos' | 'edit';

	let rootCategory: EditorCategory | null = null;
	let selectedSeq: number | null = null;
	let activeTab: TabKey = 'files';
	let materials: EditorMaterial[] = [];
	let pendingMaterials: UploadDraft[] = [];
	let videoDrafts: Record<number, string> = {};
	let loadingTree = true;
	let loadingMaterials = false;
	let submitting = false;
	let error = '';
	let notice = '';
	let selectedPath = '카테고리를 선택하세요.';
	let currentCategory: EditorCategory | null = null;
	let videoTitle = '';
	let videoUrl = '';
	let dropActive = false;
	let localSeq = -1;

	type PdfJsPage = {
		getViewport: (params: { scale: number }) => { width: number; height: number };
		render: (params: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => {
			promise: Promise<void>;
		};
	};

	type PdfJsDocument = {
		getPage: (pageNumber: number) => Promise<PdfJsPage>;
	};

	type PdfJsLib = {
		GlobalWorkerOptions: { workerSrc: string };
		getDocument: (data: Uint8Array) => { promise: Promise<PdfJsDocument> };
	};

	const isLeaf = (category: EditorCategory | null) =>
		!category || (category.sub?.length ?? 0) === 0;

	const normalizeCategory = (category: Category, parent?: number): EditorCategory => ({
		...category,
		parent: category.parent ?? parent,
		selectable: category.selectable ?? false,
		sub: (category.sub ?? []).map((child) => normalizeCategory(child, category.seq))
	});

	const findCategory = (
		category: EditorCategory | null,
		targetSeq: number | null
	): EditorCategory | null => {
		if (!category || targetSeq == null) {
			return null;
		}
		if (category.seq === targetSeq) {
			return category;
		}
		for (const child of category.sub ?? []) {
			const found = findCategory(child, targetSeq);
			if (found) {
				return found;
			}
		}
		return null;
	};

	const findPath = (
		category: EditorCategory,
		targetSeq: number,
		path: EditorCategory[] = []
	): EditorCategory[] | null => {
		const next = [...path, category];
		if (category.seq === targetSeq) {
			return next;
		}
		for (const child of category.sub ?? []) {
			const found = findPath(child, targetSeq, next);
			if (found) {
				return found;
			}
		}
		return null;
	};

	const setSelectable = (category: EditorCategory, selectable: boolean) => {
		category.selectable = selectable;
		(category.sub ?? []).forEach((child) => setSelectable(child, selectable));
	};

	const enableWorkingCategory = (category: EditorCategory, cateSeq: number) => {
		const path = findPath(category, cateSeq);
		if (!path) {
			return;
		}
		path.forEach((node) => {
			node.selectable = true;
		});
		const target = path[path.length - 1];
		setSelectable(target, true);
	};

	const toVideoDraft = (material: EditorMaterial) => {
		const source = material.contents[0]?.generatedPath ?? '';
		if (!source) {
			return '';
		}
		return source.startsWith('http') ? source : `https://www.youtube.com/embed/${source}`;
	};

	const selectedCategory = () => currentCategory;

	const orderOptions = () => materials.map((material) => material.orderNum ?? 0);
	const nextLocalSeq = () => localSeq--;

	const isImageFile = (file: File) => file.type.startsWith('image/');
	const isPdfFile = (file: File) =>
		file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

	const getPdfJsLib = () => {
		const lib = (window as typeof window & { pdfjsLib?: PdfJsLib }).pdfjsLib;
		if (!lib) {
			throw new Error('PDF 라이브러리를 불러오지 못했습니다.');
		}
		lib.GlobalWorkerOptions.workerSrc =
			'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.10.111/pdf.worker.min.js';
		return lib;
	};

	const blobToFile = (blob: Blob, name: string) =>
		new File([blob], name, {
			type: blob.type || 'image/jpeg'
		});

	const canvasToJpegBlob = (canvas: HTMLCanvasElement) =>
		new Promise<Blob>((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error('PDF 썸네일 생성에 실패했습니다.'));
						return;
					}
					resolve(blob);
				},
				'image/jpeg',
				1
			);
		});

	const pdfToThumbnailFile = async (file: File) => {
		const pdfjsLib = getPdfJsLib();
		const buffer = await file.arrayBuffer();
		const pdf = await pdfjsLib.getDocument(new Uint8Array(buffer)).promise;
		const page = await pdf.getPage(1);
		const viewport = page.getViewport({ scale: 1.5 });
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('PDF 썸네일 캔버스를 생성하지 못했습니다.');
		}
		canvas.width = viewport.width;
		canvas.height = viewport.height;
		await page.render({
			canvasContext: context,
			viewport
		}).promise;
		const blob = await canvasToJpegBlob(canvas);
		return blobToFile(blob, `${file.name}.jpg`);
	};

	$: {
		currentCategory = findCategory(rootCategory, selectedSeq);
	}

	$: {
		if (!rootCategory || selectedSeq == null) {
			selectedPath = '카테고리를 선택하세요.';
		} else {
			const path = findPath(rootCategory, selectedSeq);
			selectedPath =
				path && path.length > 0
					? path.map((category) => category.categoryName).join(' > ')
					: '카테고리를 선택하세요.';
		}
	}

	const refreshMaterials = async (cateSeq = selectedSeq) => {
		if (!cateSeq) {
			materials = [];
			return;
		}
		loadingMaterials = true;
		error = '';
		try {
			const res = await tesisApi.getEditableMaterialsByCate(cateSeq, { baseUrl: apiBase });
			if (res.success === false) {
				materials = [];
				error = res.message ?? '자료를 불러오지 못했습니다.';
				return;
			}
			materials = (res.materials ?? []) as EditorMaterial[];
			videoDrafts = Object.fromEntries(
				materials
					.filter(
						(material) =>
							material.thumnails.length === 0 &&
							material.contents.length === 1 &&
							material.contents[0].type === 'VIDEO'
					)
					.map((material) => [material.seq, toVideoDraft(material)])
			);
		} catch (err) {
			error = err instanceof Error ? err.message : '자료를 불러오지 못했습니다.';
		} finally {
			loadingMaterials = false;
		}
	};

	const refreshTree = async (preferredSeq: number | null = selectedSeq) => {
		loadingTree = true;
		error = '';
		try {
			const [cateRes, teamRes] = await Promise.all([
				tesisApi.getProjectCategory(projectSeq, { baseUrl: apiBase }),
				tesisApi.getUserTeams({ baseUrl: apiBase })
			]);
			const root = normalizeCategory(cateRes.cate);
			setSelectable(root, false);
			const teams = teamRes.teams ?? [];
			const allWorkingCategories = teams.flatMap((team: Team) => team.workingCategories ?? []);
			if (allWorkingCategories.length === 0) {
				setSelectable(root, true);
			} else {
				allWorkingCategories.forEach((category) => enableWorkingCategory(root, category.seq));
			}
			rootCategory = root;
			const preserved = findCategory(root, preferredSeq);
			selectedSeq = preserved?.seq ?? null;
		} catch (err) {
			error = err instanceof Error ? err.message : '카테고리를 불러오지 못했습니다.';
		} finally {
			loadingTree = false;
		}
	};

	const handleSelectCategory = (category: Category) => {
		selectedSeq = category.seq;
		currentCategory = findCategory(rootCategory, category.seq);
		if (activeTab === 'edit') {
			void refreshMaterials(category.seq);
		}
	};

	const withNotice = (message: string) => {
		notice = message;
		window.setTimeout(() => {
			if (notice === message) {
				notice = '';
			}
		}, 2500);
	};

	const syncMaterialView = (cateSeq = selectedSeq) => {
		materialViewSync.notify(cateSeq ?? null);
	};

	const makeThumbnailPreview = (file: File): Thumbnail => ({
		seq: nextLocalSeq(),
		generatedPath: URL.createObjectURL(file),
		originFileName: file.name,
		orderNum: 0
	});

	const makeContentPreview = (file: File): ContentFile => ({
		seq: nextLocalSeq(),
		generatedPath: '',
		originFileName: file.name,
		type: isPdfFile(file) ? 'FILE' : file.type || 'FILE',
		orderNum: 0
	});

	const refreshLocalOrders = (draft: UploadDraft): UploadDraft => ({
		...draft,
		material: {
			...draft.material,
			thumnails: draft.material.thumnails.map((thumbnail, index) => ({
				...thumbnail,
				orderNum: index
			})),
			contents: draft.material.contents.map((content, index) => ({
				...content,
				orderNum: index
			}))
		}
	});

	const revokeBlobUrl = (value: string) => {
		if (value.startsWith('blob:')) {
			URL.revokeObjectURL(value);
		}
	};

	const destroyDraft = (draft: UploadDraft) => {
		draft.material.thumnails.forEach((thumbnail) => revokeBlobUrl(thumbnail.generatedPath));
	};

	const buildDraftFiles = async (files: File[]) => {
		const thumbnailFiles: File[] = [];
		const contentFiles: File[] = [];
		const thumnails: Thumbnail[] = [];
		const contents: ContentFile[] = [];

		for (const file of files) {
			if (isImageFile(file)) {
				thumbnailFiles.push(file);
				thumnails.push(makeThumbnailPreview(file));
				continue;
			}

			contentFiles.push(file);
			contents.push(makeContentPreview(file));

			if (isPdfFile(file)) {
				const pdfThumbnail = await pdfToThumbnailFile(file);
				thumbnailFiles.push(pdfThumbnail);
				thumnails.push(makeThumbnailPreview(pdfThumbnail));
			}
		}

		return {
			thumbnailFiles,
			contentFiles,
			thumnails,
			contents
		};
	};

	const appendDraft = async (files: File[]) => {
		const current = requireSelectedCategory();
		if (!current) {
			return;
		}
		if (!isLeaf(current)) {
			alert('자료 등록용 카테고리를 선택하세요.');
			return;
		}
		if (files.length === 0) {
			return;
		}

		const built = await buildDraftFiles(files);
		if (built.thumbnailFiles.length === 0 && built.contentFiles.length === 0) {
			return;
		}

		const draftId = nextLocalSeq();
		pendingMaterials = [
			...pendingMaterials,
			refreshLocalOrders({
				id: draftId,
				thumbnailFiles: built.thumbnailFiles,
				contentFiles: built.contentFiles,
				material: {
					seq: draftId,
					title: 'no title',
					thumnails: built.thumnails,
					contents: built.contents,
					category: current,
					owner: { userName: '' },
					orderNum: pendingMaterials.length
				}
			})
		];
	};

	const updateDraft = (draftId: number, updater: (draft: UploadDraft) => UploadDraft) => {
		pendingMaterials = pendingMaterials.map((draft) =>
			draft.id === draftId ? refreshLocalOrders(updater(draft)) : draft
		);
	};

	const handleDraftDrop = async (event: DragEvent) => {
		event.preventDefault();
		dropActive = false;
		const files = Array.from(event.dataTransfer?.files ?? []);
		try {
			await appendDraft(files);
		} catch (err) {
			error = err instanceof Error ? err.message : '파일을 준비하지 못했습니다.';
		}
	};

	const handleDraftTitleInput = (draftId: number, value: string) => {
		updateDraft(draftId, (draft) => ({
			...draft,
			material: {
				...draft.material,
				title: value
			}
		}));
	};

	const handleDraftAppendFiles = async (draftId: number, files: File[]) => {
		if (files.length === 0) {
			return;
		}
		const built = await buildDraftFiles(files);
		updateDraft(draftId, (draft) => ({
			...draft,
			thumbnailFiles: [...draft.thumbnailFiles, ...built.thumbnailFiles],
			contentFiles: [...draft.contentFiles, ...built.contentFiles],
			material: {
				...draft.material,
				thumnails: [...draft.material.thumnails, ...built.thumnails],
				contents: [...draft.material.contents, ...built.contents]
			}
		}));
	};

	const handleDraftDeleteFile = (draftId: number, fileSeq: number, target: 'thumbnail' | 'content') => {
		updateDraft(draftId, (draft) => {
			if (target === 'thumbnail') {
				const thumbnail = draft.material.thumnails.find((item) => item.seq === fileSeq);
				if (thumbnail) {
					revokeBlobUrl(thumbnail.generatedPath);
				}
				const thumbnailIndex = draft.material.thumnails.findIndex((item) => item.seq === fileSeq);
				return {
					...draft,
					thumbnailFiles: draft.thumbnailFiles.filter((_, index) => index !== thumbnailIndex),
					material: {
						...draft.material,
						thumnails: draft.material.thumnails.filter((item) => item.seq !== fileSeq)
					}
				};
			}

			const contentIndex = draft.material.contents.findIndex((item) => item.seq === fileSeq);
			return {
				...draft,
				contentFiles: draft.contentFiles.filter((_, index) => index !== contentIndex),
				material: {
					...draft.material,
					contents: draft.material.contents.filter((item) => item.seq !== fileSeq)
				}
			};
		});
	};

	const handleDraftThumbnailOrder = (
		draftId: number,
		thumbnailSeq: number,
		dir: 'up' | 'down'
	) => {
		updateDraft(draftId, (draft) => {
			const index = draft.material.thumnails.findIndex((thumbnail) => thumbnail.seq === thumbnailSeq);
			const nextIndex = dir === 'up' ? index - 1 : index + 1;
			if (index < 0 || nextIndex < 0 || nextIndex >= draft.material.thumnails.length) {
				return draft;
			}

			const nextThumnails = [...draft.material.thumnails];
			const nextThumbnailFiles = [...draft.thumbnailFiles];
			[nextThumnails[index], nextThumnails[nextIndex]] = [nextThumnails[nextIndex], nextThumnails[index]];
			[nextThumbnailFiles[index], nextThumbnailFiles[nextIndex]] = [
				nextThumbnailFiles[nextIndex],
				nextThumbnailFiles[index]
			];

			return {
				...draft,
				thumbnailFiles: nextThumbnailFiles,
				material: {
					...draft.material,
					thumnails: nextThumnails
				}
			};
		});
	};

	const handleDraftRemove = (draftId: number) => {
		const draft = pendingMaterials.find((item) => item.id === draftId);
		if (draft) {
			destroyDraft(draft);
		}
		pendingMaterials = pendingMaterials.filter((draft) => draft.id !== draftId);
	};

	const handleDraftUpload = async (draftId: number) => {
		const draft = pendingMaterials.find((item) => item.id === draftId);
		if (!draft) {
			return;
		}
		if (!draft.material.title.trim()) {
			alert('자료 제목을 입력하세요.');
			return;
		}
		if (draft.thumbnailFiles.length === 0 && draft.contentFiles.length === 0) {
			alert('업로드할 파일이 없습니다.');
			return;
		}

		submitting = true;
		try {
			await tesisApi.uploadMaterial(
				draft.material.title.trim(),
				draft.material.category.seq,
				draft.thumbnailFiles,
				draft.contentFiles,
				{ baseUrl: apiBase }
			);
			destroyDraft(draft);
			pendingMaterials = pendingMaterials.filter((item) => item.id !== draftId);
			syncMaterialView(draft.material.category.seq);
			withNotice('파일 자료를 업로드했습니다.');
		} catch (err) {
			error = err instanceof Error ? err.message : '파일 업로드에 실패했습니다.';
		} finally {
			submitting = false;
		}
	};

	const requireSelectedCategory = () => {
		const current = selectedCategory();
		if (!current) {
			alert('카테고리를 선택하세요.');
			return null;
		}
		if (current.selectable === false) {
			alert('권한이 없습니다.');
			return null;
		}
		return current;
	};

	const handleAddCategory = async () => {
		const current = requireSelectedCategory();
		if (!current) {
			return;
		}
		const name = window.prompt('카테고리 이름 입력', '');
		if (!name?.trim()) {
			return;
		}
		await tesisApi.createCategory(current.seq, name.trim(), { baseUrl: apiBase });
		await refreshTree(current.seq);
		withNotice('카테고리를 추가했습니다.');
	};

	const handleRenameCategory = async () => {
		const current = requireSelectedCategory();
		if (!current) {
			return;
		}
		const name = window.prompt('카테고리 이름 변경', current.categoryName);
		if (!name?.trim()) {
			return;
		}
		await tesisApi.renameCategory(current.seq, name.trim(), { baseUrl: apiBase });
		await refreshTree(current.seq);
		withNotice('카테고리 이름을 변경했습니다.');
	};

	const handleDeleteCategory = async () => {
		const current = requireSelectedCategory();
		if (!current) {
			return;
		}
		if (!window.confirm(`"${current.categoryName}" 카테고리를 삭제합니다.`)) {
			return;
		}
		await tesisApi.deleteCategory(current.seq, { baseUrl: apiBase });
		await refreshTree(current.parent ?? null);
		withNotice('카테고리를 삭제했습니다.');
	};

	const handleMoveCategory = async (dir: 'up' | 'down') => {
		const current = requireSelectedCategory();
		if (!current) {
			return;
		}
		await tesisApi.reorderCategory(current.seq, dir, { baseUrl: apiBase });
		await refreshTree(current.seq);
		withNotice('카테고리 순서를 변경했습니다.');
	};

	const handleUploadVideo = async () => {
		const current = requireSelectedCategory();
		if (!current) {
			return;
		}
		if (!isLeaf(current)) {
			alert('자료 등록용 카테고리를 선택하세요.');
			return;
		}
		if (!videoTitle.trim() || !videoUrl.trim()) {
			alert('제목과 URL을 입력하세요.');
			return;
		}
		submitting = true;
		try {
			await tesisApi.uploadVideo(videoTitle.trim(), current.seq, videoUrl.trim(), {
				baseUrl: apiBase
			});
			videoTitle = '';
			videoUrl = '';
			activeTab = 'edit';
			await refreshMaterials(current.seq);
			syncMaterialView(current.seq);
			withNotice('동영상을 등록했습니다.');
		} catch (err) {
			error = err instanceof Error ? err.message : '동영상 등록에 실패했습니다.';
		} finally {
			submitting = false;
		}
	};

	const handleSaveTitle = async (material: EditorMaterial) => {
		await tesisApi.updateMaterial(material.seq, 'title', material.title, { baseUrl: apiBase });
		syncMaterialView(selectedSeq);
		withNotice('제목을 수정했습니다.');
	};

	const handleSaveVideoUrl = async (material: EditorMaterial) => {
		const value = videoDrafts[material.seq]?.trim();
		if (!value) {
			alert('URL을 입력하세요.');
			return;
		}
		await tesisApi.updateMaterial(material.seq, 'video-url', value, { baseUrl: apiBase });
		await refreshMaterials(selectedSeq);
		syncMaterialView(selectedSeq);
		withNotice('동영상 URL을 수정했습니다.');
	};

	const handleDeleteUpfile = async (fileSeq: number) => {
		await tesisApi.deleteUpfile(fileSeq, { baseUrl: apiBase });
		await refreshMaterials(selectedSeq);
		syncMaterialView(selectedSeq);
		withNotice('파일을 삭제했습니다.');
	};

	const handleAppendFiles = async (materialSeq: number, files: File[]) => {
		if (files.length === 0) {
			return;
		}
		await tesisApi.appendMaterialFiles(materialSeq, files, { baseUrl: apiBase });
		await refreshMaterials(selectedSeq);
		syncMaterialView(selectedSeq);
		withNotice('파일을 추가했습니다.');
	};

	const handleDeleteMaterial = async (materialSeq: number) => {
		if (!window.confirm('수업자료를 삭제합니다.')) {
			return;
		}
		await tesisApi.deleteMaterial(materialSeq, { baseUrl: apiBase });
		await refreshMaterials(selectedSeq);
		syncMaterialView(selectedSeq);
		withNotice('자료를 삭제했습니다.');
	};

	const handleThumbnailOrder = async (
		material: EditorMaterial,
		thumbnail: Thumbnail,
		dir: 'up' | 'down'
	) => {
		const currentOrder = thumbnail.orderNum ?? 0;
		const nextOrder = dir === 'up' ? currentOrder - 1 : currentOrder + 1;
		if (nextOrder < 0) {
			return;
		}
		await tesisApi.reorderMaterialThumbnails(material.seq, currentOrder, nextOrder, {
			baseUrl: apiBase
		});
		await refreshMaterials(selectedSeq);
		syncMaterialView(selectedSeq);
		withNotice('썸네일 순서를 변경했습니다.');
	};

	const handleMaterialOrder = async (material: EditorMaterial, value: number) => {
		const current = selectedCategory();
		if (!current) {
			return;
		}
		await tesisApi.reorderCategoryMaterials(current.seq, material.orderNum ?? 0, value, {
			baseUrl: apiBase
		});
		await refreshMaterials(current.seq);
		syncMaterialView(current.seq);
		withNotice('자료 순서를 변경했습니다.');
	};

	const handleVideoDraftInput = (materialSeq: number, value: string) => {
		videoDrafts = {
			...videoDrafts,
			[materialSeq]: value
		};
	};

	const switchTab = async (tab: TabKey) => {
		activeTab = tab;
		if (tab === 'edit') {
			await refreshMaterials(selectedSeq);
		}
	};

	onMount(() => {
		void refreshTree();
		return () => {
			pendingMaterials.forEach((draft) => destroyDraft(draft));
		};
	});
</script>

<div class="category-editor">
	<header class="editor-header">
		<div>
			<p class="eyebrow">{projectCode || 'project'} / Category Editor</p>
			<h2>자료 편집기</h2>
		</div>
		<button
			type="button"
			class="close-btn btn btn-outline-dark"
			on:click={() => modalContext.closeModal()}
		>
			닫기
		</button>
	</header>

	{#if error}
		<div class="alert alert-danger">{error}</div>
	{/if}
	{#if notice}
		<div class="alert alert-success">{notice}</div>
	{/if}

	<div class="editor-shell">
		<aside class="editor-sidebar">
			<div class="sidebar-header">
				<h3>카테고리</h3>
				<p>{selectedCategory()?.categoryName ?? '선택 없음'}</p>
			</div>
			<div class="category-actions">
				<button type="button" class="btn btn-info btn-sm" on:click={handleAddCategory}>추가</button>
				<button type="button" class="btn btn-info btn-sm" on:click={handleRenameCategory}
					>이름변경</button
				>
				<button type="button" class="btn btn-danger btn-sm" on:click={handleDeleteCategory}
					>삭제</button
				>
				<button
					type="button"
					class="btn btn-outline-secondary btn-sm"
					on:click={() => handleMoveCategory('up')}>위로</button
				>
				<button
					type="button"
					class="btn btn-outline-secondary btn-sm"
					on:click={() => handleMoveCategory('down')}>아래로</button
				>
			</div>

			<div class="category-tree">
				{#if loadingTree}
					<p class="empty">카테고리를 불러오는 중입니다.</p>
				{:else if rootCategory}
					<ul>
						<CategoryEditorTree node={rootCategory} {selectedSeq} onSelect={handleSelectCategory} />
					</ul>
				{:else}
					<p class="empty">카테고리가 없습니다.</p>
				{/if}
			</div>
		</aside>

		<section class="editor-main">
			<div class="panel-head panel-head-main">
				<h3>{selectedPath}</h3>
			</div>

			{#if !currentCategory}
				<div class="panel empty-panel">
					<p class="empty">왼쪽 트리에서 카테고리를 선택하세요.</p>
				</div>
			{:else}
				<nav class="tab-nav">
					<button
						type="button"
						class:active={activeTab === 'files'}
						on:click={() => switchTab('files')}>파일자료</button
					>
					<button
						type="button"
						class:active={activeTab === 'videos'}
						on:click={() => switchTab('videos')}>동영상자료</button
					>
					<button
						type="button"
						class:active={activeTab === 'edit'}
						on:click={() => switchTab('edit')}>자료편집</button
					>
				</nav>

				{#if activeTab === 'files'}
					<div class="panel">
						<h3>파일 자료 준비</h3>
						<p class="helper">
							업로드 대상 카테고리: <strong>{currentCategory?.categoryName ?? '선택 없음'}</strong>
						</p>
						<div
							class="drop-zone"
							class:active={dropActive}
							on:dragenter|preventDefault={() => (dropActive = true)}
							on:dragover|preventDefault={() => (dropActive = true)}
							on:dragleave|preventDefault={() => (dropActive = false)}
							on:drop={handleDraftDrop}
						>
							<p>파일을 여기로 드롭해서 업로드 대기 Material을 만드세요.</p>
							<p>한 번 드롭한 파일 묶음은 Material 하나로 준비됩니다.</p>
							<p>이미지는 자동으로 썸네일로 분류되고, PDF는 첫 페이지가 썸네일로 추가됩니다.</p>
						</div>
						{#if pendingMaterials.length === 0}
							<p class="empty">드롭한 파일이 없습니다.</p>
						{:else}
							<div class="material-list">
								{#each pendingMaterials as draft (draft.id)}
									<MaterialCardEditor
										mode="insert"
										material={draft.material}
										onDraftTitleInput={handleDraftTitleInput}
										onDraftDeleteFile={handleDraftDeleteFile}
										onDraftAppendFiles={handleDraftAppendFiles}
										onDraftUpload={handleDraftUpload}
										onDraftRemove={handleDraftRemove}
										onDraftThumbnailOrder={handleDraftThumbnailOrder}
									/>
								{/each}
							</div>
						{/if}
					</div>
				{:else if activeTab === 'videos'}
				<div class="panel">
					<h3>동영상 등록</h3>
					<p class="helper">
						등록 대상 카테고리: <strong>{currentCategory?.categoryName ?? '선택 없음'}</strong>
					</p>
					<div class="form-grid">
						<label>
							<span>제목</span>
							<input class="form-control" bind:value={videoTitle} placeholder="동영상 제목" />
						</label>
						<label>
							<span>YouTube URL</span>
							<input class="form-control" bind:value={videoUrl} placeholder="URL 입력" />
						</label>
					</div>
					<button
						type="button"
						class="btn btn-primary"
						disabled={submitting}
						on:click={handleUploadVideo}
					>
						등록
					</button>
				</div>
				{:else}
					<div class="panel">
					<div class="panel-head">
						<button
							type="button"
							class="btn btn-outline-secondary ml-auto"
							on:click={() => refreshMaterials(selectedSeq)}
						>
							새로고침
						</button>
					</div>

					{#if loadingMaterials}
						<p class="empty">자료를 불러오는 중입니다.</p>
					{:else if materials.length === 0}
						<p class="empty">등록된 자료가 없습니다.</p>
					{:else}
						<div class="material-list">
							{#each materials as material (material.seq)}
								<MaterialCardEditor
									{material}
									orderOptions={orderOptions()}
									videoDraft={videoDrafts[material.seq] ?? ''}
									onSaveTitle={handleSaveTitle}
									onVideoDraftInput={handleVideoDraftInput}
									onSaveVideoUrl={handleSaveVideoUrl}
									onDeleteUpfile={handleDeleteUpfile}
									onAppendFiles={handleAppendFiles}
									onDeleteMaterial={handleDeleteMaterial}
									onThumbnailOrder={handleThumbnailOrder}
									onMaterialOrder={handleMaterialOrder}
								/>
							{/each}
						</div>
					{/if}
					</div>
				{/if}
			{/if}
		</section>
	</div>
</div>

<style lang="scss">
	.category-editor {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
		color: #0f172a;
	}

	.editor-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding-bottom: 18px;
		border-bottom: 1px solid rgba(148, 163, 184, 0.3);

		h2 {
			margin: 0;
			font-size: 2rem;
			font-weight: 800;
		}
	}

	.eyebrow {
		margin: 0 0 6px;
		color: #0f766e;
		font-size: 0.85rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.editor-shell {
		display: grid;
		grid-template-columns: 320px minmax(0, 1fr);
		gap: 24px;
		flex: 1 1 auto;
		min-height: 0;
		padding-top: 20px;
	}

	.editor-sidebar,
	.panel {
		min-height: 0;
		border: 1px solid rgba(148, 163, 184, 0.24);
		border-radius: 24px;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
	}

	.editor-sidebar {
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.sidebar-header,
	.category-actions,
	.panel,
	.tab-nav {
		padding: 18px 20px;
	}

	.sidebar-header {
		border-bottom: 1px solid rgba(148, 163, 184, 0.2);

		h3,
		p {
			margin: 0;
		}

		p {
			margin-top: 6px;
			color: #475569;
		}
	}

	.category-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		border-bottom: 1px solid rgba(148, 163, 184, 0.2);
	}

	.category-tree {
		flex: 1 1 auto;
		min-height: 0;
		padding: 18px 14px 20px;
		overflow: auto;

		ul {
			margin: 0;
			padding: 0;
		}
	}

	.editor-main {
		display: flex;
		flex-direction: column;
		min-width: 0;
		min-height: 0;
	}

	.tab-nav {
		display: flex;
		gap: 10px;
		padding: 0 0 16px;

		button {
			padding: 10px 18px;
			border: 0;
			border-radius: 999px;
			background: #e2e8f0;
			color: #334155;
			font-weight: 700;

			&.active {
				background: #0f766e;
				color: #fff;
			}
		}
	}

	.panel {
		display: flex;
		flex-direction: column;
		flex: 1 1 auto;
		gap: 18px;
		overflow: auto;
	}

	.editor-main > .panel {
		padding: 0;
		border: 0;
		border-radius: 0;
		box-shadow: none;
		background: transparent;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.empty-panel {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 320px;
	}

	.form-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 16px;

		label {
			display: flex;
			flex-direction: column;
			gap: 8px;
			font-weight: 600;
		}
	}

	.file-summary,
	.helper {
		margin: 0;
		color: #475569;
	}

	.drop-zone {
		display: grid;
		place-items: center;
		gap: 8px;
		min-height: 180px;
		padding: 28px;
		border: 2px dashed rgba(15, 118, 110, 0.35);
		border-radius: 22px;
		background:
			radial-gradient(circle at top, rgba(15, 118, 110, 0.08), transparent 44%),
			#f8fafc;
		text-align: center;
		transition:
			border-color 120ms ease,
			background-color 120ms ease,
			transform 120ms ease;

		p {
			margin: 0;
			color: #475569;
		}

		&.active {
			border-color: #0f766e;
			background:
				radial-gradient(circle at top, rgba(15, 118, 110, 0.16), transparent 48%),
				#ecfeff;
			transform: scale(0.995);
		}
	}

	.panel-head {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.panel-head {
		justify-content: space-between;
	}

	.panel-head-main {
		padding: 0 0 16px;

		h3 {
			margin: 0;
			text-align: left;
		}
	}

	.material-list {
		display: grid;
		gap: 18px;
	}

	.empty {
		margin: 0;
		color: #64748b;
	}

	.close-btn {
		flex: 0 0 auto;
	}

	@media (max-width: 1024px) {
		.editor-shell {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.editor-header {
			align-items: flex-start;
			flex-direction: column;
		}

		.form-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
