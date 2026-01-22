<script lang="ts">
	import { onDestroy } from 'svelte';
	import { tesisApi } from '$lib/api';
	import type { Mention, User } from '$lib/type';

	export let open = false;
	export let materialSeq: number | null = null;

	let mentions: Mention[] = [];
	let me: User | null = null;
	let editSeq: number | null = null;
	let text = '';
	let updateMode = false;
	let loading = false;
	let loadedSeq: number | null = null;

	const apiBase = import.meta.env.VITE_API_BASE ?? '';

	const resetWriteMode = () => {
		updateMode = false;
		editSeq = null;
		text = '';
	};

	const t2s = (t: number) => {
		const cur = Date.now();
		const sec = (cur - t) / 1000;
		if (sec < 60) return `${Math.floor(sec)}초전`;
		const min = sec / 60;
		if (min < 60) return `${Math.floor(min)}분전`;
		const h = min / 60;
		if (h < 60) return `${Math.floor(h)}시간전`;
		const d = h / 24;
		if (d < 24) return `${Math.floor(d)}일 전`;
		const m = d / 30;
		return `${Math.floor(m)}달전`;
	};

	const isMine = (mention: Mention) => me && mention.writer?.seq === me.seq;

	const loadMentions = async () => {
		if (!materialSeq) return;
		if (loadedSeq === materialSeq) return;
		loading = true;
		try {
			const res = await tesisApi.getMentions(materialSeq, { baseUrl: apiBase });
			if (res.success) {
				mentions = res.mentions ?? [];
				me = res.me;
				loadedSeq = materialSeq;
			}
		} finally {
			loading = false;
		}
	};

	const writeMention = async () => {
		if (!materialSeq) return;
		if (!text.trim()) {
			alert('내용이 없습니다.');
			return;
		}
		const res = await tesisApi.writeMention(materialSeq, text.trim(), { baseUrl: apiBase });
		if (res.success) {
			mentions = [res.mention, ...mentions];
			text = '';
		}
	};

	const updateMention = async () => {
		if (!editSeq) return;
		if (!text.trim()) {
			alert('내용이 없습니다.');
			return;
		}
		const res = await tesisApi.updateMention(editSeq, text.trim(), { baseUrl: apiBase });
		if (res.success) {
			mentions = mentions.map((m) => (m.seq === editSeq ? res.mention : m));
			resetWriteMode();
		} else {
			alert('수정 실패');
		}
	};

	const deleteMention = async (mentionSeq: number) => {
		const res = await tesisApi.deleteMention(mentionSeq, { baseUrl: apiBase });
		if (res.success) {
			mentions = mentions.filter((m) => m.seq !== mentionSeq);
		} else {
			alert('삭제 실패');
		}
	};

	const startEdit = (mention: Mention) => {
		editSeq = mention.seq;
		text = mention.mention;
		updateMode = true;
	};

	const close = () => {
		open = false;
		resetWriteMode();
		loadedSeq = null;
	};

	$: if (open && materialSeq) {
		loadMentions();
	}

	$: if (!open) {
		loadedSeq = null;
	}

	onDestroy(() => {
		resetWriteMode();
	});
</script>

{#if open}
	<div class="mention-wrapper" style="display: block">
		<div class="mention-holder">
			<div class="writing">
				<button class="btn-close btn btn-light btn-sm form-control" on:click={close}>닫기</button>
				<textarea rows="3" class="mention form-control" bind:value={text}></textarea>
				<div class="w-mode" style:display={updateMode ? 'none' : 'block'}>
					<button class="btn-write btn btn-primary btn-sm form-control" on:click={writeMention}>
						의견 남기기
					</button>
				</div>
				<div class="u-mode mt-3 mb-3" style:display={updateMode ? 'block' : 'none'}>
					<button class="btn-update btn btn-success btn-sm" on:click={updateMention}>의견수정</button>
					<button class="btn-reset btn btn-danger btn-sm" on:click={resetWriteMode}>취소</button>
				</div>
			</div>
			<table class="table">
				<thead>
					<tr>
						<td>작성자</td>
						<td>내용</td>
						<td>작성시간</td>
					</tr>
				</thead>
				<tbody>
					{#if loading}
						<tr>
							<td colspan="3">로딩 중...</td>
						</tr>
					{:else}
						{#each mentions as mention (mention.seq)}
							{@const lines = mention.mention.split('\n')}
							<tr class={updateMode && mention.seq === editSeq ? 'success' : ''} data-mseq={mention.seq}>
								<td>{mention.writer?.userName}</td>
								<td class="mention">
									{#each lines as line, idx}
										<span>{line}</span>{#if idx < lines.length - 1}<br />{/if}
									{/each}
								</td>
								<td>{t2s(mention.createdTime)}</td>
								<td class={isMine(mention) ? 'del-td' : 'del-td hide-it'}>
									<a href="#" class="edit-mention" on:click|preventDefault={() => startEdit(mention)}>
										<span class="material-icons">edit</span>
									</a>
									<a href="#" class="del-mention" on:click|preventDefault={() => deleteMention(mention.seq)}>
										<span class="material-icons">clear</span>
									</a>
								</td>
							</tr>
						{/each}
					{/if}
				</tbody>
			</table>
		</div>
	</div>
{/if}

<style lang="scss">
	.mention-wrapper {
		display: block;
	}
	.mention-wrapper .mention-holder {
		margin: auto;
	}
</style>
