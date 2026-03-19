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

	type TabKey = 'files' | 'videos' | 'edit';

	let rootCategory: EditorCategory | null = null;
	let selectedSeq: number | null = null;
	let activeTab: TabKey = 'files';
	let materials: EditorMaterial[] = [];
	let videoDrafts: Record<number, string> = {};
	let loadingTree = true;
	let loadingMaterials = false;
	let submitting = false;
	let error = '';
	let notice = '';
	let selectedPath = '카테고리를 선택하세요.';

	let fileTitle = '';
	let uploadThumnails: File[] = [];
	let uploadContents: File[] = [];
	let uploadPayload: { thumnails: File[]; contents: File[] } = { thumnails: [], contents: [] };
	let videoTitle = '';
	let videoUrl = '';

	const isLeaf = (category: EditorCategory | null) =>
		!category || (category.sub?.length ?? 0) === 0;

	const normalizeCategory = (category: Category, parent?: number): EditorCategory => ({
		...category,
		parent: category.parent ?? parent,
		selectable: category.selectable ?? false,
		sub: (category.sub ?? []).map((child) => normalizeCategory(child, category.seq))
	});

	const walkCategories = (category: EditorCategory, callback: (value: EditorCategory) => void) => {
		callback(category);
		(category.sub ?? []).forEach((child) => walkCategories(child, callback));
	};

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

	const firstSelectableLeaf = (category: EditorCategory): EditorCategory | null => {
		if (category.selectable !== false && isLeaf(category)) {
			return category;
		}
		for (const child of category.sub ?? []) {
			const found = firstSelectableLeaf(child);
			if (found) {
				return found;
			}
		}
		return category.selectable !== false ? category : null;
	};

	const toVideoDraft = (material: EditorMaterial) => {
		const source = material.contents[0]?.generatedPath ?? '';
		if (!source) {
			return '';
		}
		return source.startsWith('http') ? source : `https://www.youtube.com/embed/${source}`;
	};

	const selectedCategory = () => findCategory(rootCategory, selectedSeq);

	const orderOptions = () => materials.map((material) => material.orderNum ?? 0);

	const isImageFile = (file: File) => file.type.startsWith('image/');

	const classifyUploadFiles = () => {
		const thumnails = [...uploadThumnails];
		const contents: File[] = [];

		for (const file of uploadContents) {
			if (isImageFile(file)) {
				thumnails.push(file);
			} else {
				contents.push(file);
			}
		}

		return { thumnails, contents };
	};

	const syncUploadPayload = () => {
		uploadPayload = classifyUploadFiles();
	};

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
			selectedSeq = preserved?.seq ?? firstSelectableLeaf(root)?.seq ?? root.seq;
		} catch (err) {
			error = err instanceof Error ? err.message : '카테고리를 불러오지 못했습니다.';
		} finally {
			loadingTree = false;
		}
	};

	const handleSelectCategory = (category: Category) => {
		selectedSeq = category.seq;
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

	const handleFileInput = (event: Event, target: 'thumbs' | 'contents') => {
		const files = Array.from((event.currentTarget as HTMLInputElement).files ?? []);
		if (target === 'thumbs') {
			uploadThumnails = files;
		} else {
			uploadContents = files;
		}
		syncUploadPayload();
	};

	const resetUploadFields = () => {
		fileTitle = '';
		uploadThumnails = [];
		uploadContents = [];
		uploadPayload = { thumnails: [], contents: [] };
		videoTitle = '';
		videoUrl = '';
	};

	const handleUploadFiles = async () => {
		const current = requireSelectedCategory();
		if (!current) {
			return;
		}
		if (!isLeaf(current)) {
			alert('자료 등록용 카테고리를 선택하세요.');
			return;
		}
		if (!fileTitle.trim()) {
			alert('자료 제목을 입력하세요.');
			return;
		}
		if (uploadPayload.thumnails.length === 0 && uploadPayload.contents.length === 0) {
			alert('업로드할 파일을 선택하세요.');
			return;
		}
		submitting = true;
		try {
			await tesisApi.uploadMaterial(
				fileTitle.trim(),
				current.seq,
				uploadPayload.thumnails,
				uploadPayload.contents,
				{ baseUrl: apiBase }
			);
			resetUploadFields();
			activeTab = 'edit';
			await refreshMaterials(current.seq);
			syncMaterialView(current.seq);
			withNotice('파일 자료를 업로드했습니다.');
		} catch (err) {
			error = err instanceof Error ? err.message : '파일 업로드에 실패했습니다.';
		} finally {
			submitting = false;
		}
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
			resetUploadFields();
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

	onMount(async () => {
		syncUploadPayload();
		await refreshTree();
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
				<button type="button" class:active={activeTab === 'edit'} on:click={() => switchTab('edit')}
					>자료편집</button
				>
			</nav>

			{#if activeTab === 'files'}
				<div class="panel">
					<h3>파일 자료 업로드</h3>
					<p class="helper">
						업로드 대상 카테고리: <strong>{selectedCategory()?.categoryName ?? '선택 없음'}</strong>
					</p>
					<div class="form-grid">
						<label>
							<span>자료 제목</span>
							<input class="form-control" bind:value={fileTitle} placeholder="자료 제목" />
						</label>
						<label>
							<span>썸네일 파일</span>
							<input type="file" multiple on:change={(event) => handleFileInput(event, 'thumbs')} />
						</label>
						<label>
							<span>콘텐츠 파일</span>
							<input
								type="file"
								multiple
								on:change={(event) => handleFileInput(event, 'contents')}
							/>
						</label>
					</div>
					<div class="file-summary">
						<p>썸네일 {uploadPayload.thumnails.length}개</p>
						<p>콘텐츠 {uploadPayload.contents.length}개</p>
						<p>이미지 파일은 레거시처럼 자동으로 썸네일로 분류됩니다.</p>
					</div>
					<button
						type="button"
						class="btn btn-primary"
						disabled={submitting}
						on:click={handleUploadFiles}
					>
						업로드
					</button>
				</div>
			{:else if activeTab === 'videos'}
				<div class="panel">
					<h3>동영상 등록</h3>
					<p class="helper">
						등록 대상 카테고리: <strong>{selectedCategory()?.categoryName ?? '선택 없음'}</strong>
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
