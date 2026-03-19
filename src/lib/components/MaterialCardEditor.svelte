<script lang="ts">
	import type { Material, Thumbnail } from '$lib/type';

	export let material: Material;
	export let orderOptions: number[] = [];
	export let videoDraft = '';
	export let onSaveTitle: (material: Material) => void;
	export let onVideoDraftInput: (materialSeq: number, value: string) => void;
	export let onSaveVideoUrl: (material: Material) => void;
	export let onDeleteUpfile: (fileSeq: number) => void;
	export let onAppendFiles: (materialSeq: number, files: File[]) => void;
	export let onDeleteMaterial: (materialSeq: number) => void;
	export let onThumbnailOrder: (material: Material, thumbnail: Thumbnail, dir: 'up' | 'down') => void;
	export let onMaterialOrder: (material: Material, value: number) => void;

	const isVideoOnly = () =>
		material.thumnails.length === 0 &&
		material.contents.length === 1 &&
		material.contents[0].type === 'VIDEO';

	const handleMaterialOrderChange = (event: Event) => {
		const target = event.currentTarget as HTMLSelectElement | null;
		if (!target) {
			return;
		}
		onMaterialOrder(material, Number(target.value));
	};

	const handleAppendFilesChange = (event: Event) => {
		const target = event.currentTarget as HTMLInputElement | null;
		if (!target) {
			return;
		}
		const files = Array.from(target.files ?? []);
		if (files.length === 0) {
			return;
		}
		onAppendFiles(material.seq, files);
		target.value = '';
	};

	const handleVideoDraftChange = (event: Event) => {
		const target = event.currentTarget as HTMLInputElement | null;
		if (!target) {
			return;
		}
		onVideoDraftInput(material.seq, target.value);
	};
</script>

<article class="material-card">
	<div class="material-head">
		<div class="title-row">
			<input class="form-control" bind:value={material.title} />
			<button type="button" class="btn btn-sm btn-secondary" on:click={() => onSaveTitle(material)}>
				제목수정
			</button>
		</div>
		<div class="order-row">
			<select class="form-control" value={material.orderNum} on:change={handleMaterialOrderChange}>
				{#each orderOptions as order}
					<option value={order}>{order}</option>
				{/each}
			</select>
			<button type="button" class="btn btn-sm btn-danger" on:click={() => onDeleteMaterial(material.seq)}>
				삭제
			</button>
		</div>
	</div>

	{#if material.thumnails.length > 0}
		<div class="asset-block">
			<h4>썸네일</h4>
			<div class="thumb-grid">
				{#each material.thumnails as thumbnail (thumbnail.seq)}
					<div class="thumb-card">
						<img
							src={`https://kr.object.ncloudstorage.com/tesis/${thumbnail.generatedPath}`}
							alt={thumbnail.originFileName}
						/>
						<div class="thumb-actions">
							<span>{thumbnail.originFileName}</span>
							<div>
								<button
									type="button"
									class="btn btn-sm btn-light"
									on:click={() => onThumbnailOrder(material, thumbnail, 'up')}
								>
									▲
								</button>
								<button
									type="button"
									class="btn btn-sm btn-light"
									on:click={() => onThumbnailOrder(material, thumbnail, 'down')}
								>
									▼
								</button>
								<button
									type="button"
									class="btn btn-sm btn-outline-danger"
									on:click={() => onDeleteUpfile(thumbnail.seq)}
								>
									삭제
								</button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<div class="asset-block">
		<h4>콘텐츠 파일</h4>
		<ul class="file-list">
			{#each material.contents as file (file.seq)}
				<li>
					<span>{file.originFileName}</span>
					<button type="button" class="btn btn-sm btn-outline-danger" on:click={() => onDeleteUpfile(file.seq)}>
						삭제
					</button>
				</li>
			{/each}
		</ul>
	</div>

	{#if isVideoOnly()}
		<div class="asset-block">
			<h4>동영상 URL</h4>
			<div class="title-row">
				<input class="form-control" value={videoDraft} on:input={handleVideoDraftChange} />
				<button type="button" class="btn btn-sm btn-secondary" on:click={() => onSaveVideoUrl(material)}>
					URL수정
				</button>
			</div>
		</div>
	{/if}

	<div class="asset-block">
		<h4>파일 추가</h4>
		<input type="file" multiple on:change={handleAppendFilesChange} />
	</div>
</article>

<style lang="scss">
	.material-card {
		padding: 18px;
		border: 1px solid rgba(148, 163, 184, 0.24);
		border-radius: 18px;
		background: #fff;
	}

	.material-head,
	.title-row,
	.order-row,
	.thumb-actions,
	.file-list li {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.material-head {
		align-items: flex-start;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.title-row {
		flex: 1 1 420px;
	}

	.order-row {
		flex: 0 0 auto;

		select {
			width: 90px;
		}
	}

	.asset-block {
		display: grid;
		gap: 12px;
		margin-top: 18px;

		h4 {
			margin: 0;
			font-size: 1rem;
			font-weight: 700;
			text-align: left;
		}
	}

	.thumb-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 14px;
	}

	.thumb-card {
		overflow: hidden;
		border: 1px solid rgba(148, 163, 184, 0.24);
		border-radius: 16px;
		background: #f8fafc;

		img {
			display: block;
			width: 100%;
			height: 180px;
			object-fit: cover;
		}
	}

	.thumb-actions {
		flex-direction: column;
		align-items: stretch;
		padding: 12px;

		> div {
			display: flex;
			gap: 6px;
			justify-content: flex-end;
		}

		span {
			font-size: 0.9rem;
			word-break: break-all;
		}
	}

	.file-list {
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;

		li {
			justify-content: space-between;
			padding: 10px 12px;
			border-radius: 12px;
			background: #f8fafc;
		}
	}
</style>
