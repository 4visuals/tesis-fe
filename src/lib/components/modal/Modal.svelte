<script lang="ts">
	import { onDestroy } from 'svelte';
	import { modalContext, type ModalState, type ModalWidth } from './index';

	const widthMap: Record<ModalWidth, string> = {
		sm: '420px',
		md: '720px',
		lg: 'calc(100vw - 24px)'
	};

	let state: ModalState = {
		open: false,
		options: null
	};

	const unsubscribe = modalContext.subscribe((value) => {
		state = value;
	});

	onDestroy(() => {
		unsubscribe();
	});

	$: if (typeof document !== 'undefined') {
		document.body.style.overflow = state.open ? 'hidden' : '';
	}

	const close = () => {
		modalContext.closeModal();
	};

	const handleBackdropClick = (event: MouseEvent) => {
		if (event.target === event.currentTarget) {
			close();
		}
	};

	const handleKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Escape' && state.open) {
			close();
		}
	};

	$: modalWidth = state.options ? widthMap[state.options.width] : widthMap.md;
	$: modalHeight = state.options?.height.size ?? 'auto';
	$: panelHeight = modalHeight === 'auto' ? 'auto' : modalHeight;
	$: modalPadding = state.options?.padding ?? '16px';
	$: bodyOverflow = state.options?.height.scrollable ? 'auto' : 'hidden';
</script>

<svelte:window on:keydown={handleKeydown} />

{#if state.open && state.options}
	<div
		class="modal-layer"
		on:click={handleBackdropClick}
		role="presentation"
		style={`--modal-layer-padding:${modalPadding};`}
	>
		<div
			class="modal-panel"
			role="dialog"
			aria-modal="true"
			style={`--modal-width:${modalWidth}; --modal-height:${modalHeight}; --modal-panel-height:${panelHeight}; --modal-padding:${modalPadding};`}
		>
			<button class="modal-close" type="button" aria-label="Close modal" on:click={close}>
				<span class="material-icons">close</span>
			</button>
			<div class="modal-body" style={`overflow-y:${bodyOverflow};`}>
				<svelte:component this={state.options.component} {...(state.options.props ?? {})} />
			</div>
		</div>
	</div>
{/if}

<style lang="scss">
	:global(body) {
		--modal-backdrop: rgba(17, 24, 39, 0.56);
		--modal-surface: #fff;
		--modal-border: rgba(15, 23, 42, 0.08);
		--modal-shadow: 0 28px 70px rgba(15, 23, 42, 0.32);
		--modal-close-bg: rgba(248, 250, 252, 0.96);
		--modal-close-fg: #0f172a;
	}

	.modal-layer {
		position: fixed;
		inset: 0;
		z-index: 2000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--modal-layer-padding);
		background:
			radial-gradient(circle at top, rgba(255, 255, 255, 0.16), transparent 28%),
			var(--modal-backdrop);
		backdrop-filter: blur(6px);
	}

	.modal-panel {
		position: relative;
		display: flex;
		flex-direction: column;
		width: min(calc(100vw - 32px), var(--modal-width));
		height: var(--modal-panel-height);
		max-height: calc(100vh - 48px);
		border: 1px solid var(--modal-border);
		border-radius: 24px;
		background: var(--modal-surface);
		box-shadow: var(--modal-shadow);
		overflow: hidden;
		animation: modal-enter 180ms ease-out;
	}

	.modal-close {
		position: absolute;
		top: 14px;
		right: 14px;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 0;
		border-radius: 999px;
		background: var(--modal-close-bg);
		color: var(--modal-close-fg);
		box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
		cursor: pointer;
		transition:
			transform 120ms ease,
			background-color 120ms ease;

		&:hover {
			transform: scale(1.04);
			background: #fff;
		}
	}

	.modal-body {
		height: var(--modal-height);
		max-height: calc(100vh - 48px);
		flex: 1 1 auto;
		padding: 28px;
	}

	@keyframes modal-enter {
		from {
			opacity: 0;
			transform: translateY(12px) scale(0.985);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@media (max-width: 768px) {
		.modal-layer {
			align-items: flex-end;
			padding: var(--modal-layer-padding);
		}

		.modal-panel {
			width: 100%;
			max-height: calc(100vh - 12px);
			border-radius: 24px 24px 0 0;
		}

		.modal-body {
			max-height: calc(100vh - 12px);
			padding: 22px 18px 18px;
		}
	}
</style>
