import { writable } from 'svelte/store';
import type { ComponentType, SvelteComponent } from 'svelte';

export type ModalWidth = 'sm' | 'md' | 'lg';

export type ModalHeight = {
	size: 'auto' | string;
	scrollable: boolean;
};

export type ModalComponent<Props extends Record<string, any> = Record<string, any>> = ComponentType<
	SvelteComponent<Props>
>;

export type ModalOptions<Props extends Record<string, any> = Record<string, any>> = {
	width: ModalWidth;
	height: ModalHeight;
	padding?: string;
	component: ModalComponent<Props>;
	props?: Props;
};

export type ModalState = {
	open: boolean;
	options: ModalOptions | null;
};

const initialState: ModalState = {
	open: false,
	options: null
};

const store = writable<ModalState>(initialState);

export const modalContext = {
	subscribe: store.subscribe,
	startModal(options: ModalOptions) {
		store.set({
			open: true,
			options
		});
	},
	closeModal() {
		store.set(initialState);
	}
};

export { default as Modal } from './Modal.svelte';
