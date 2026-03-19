import { writable } from 'svelte/store';

type MaterialViewSyncPayload = {
	version: number;
	cateSeq: number | null;
};

const createMaterialViewSync = () => {
	const { subscribe, update } = writable<MaterialViewSyncPayload>({
		version: 0,
		cateSeq: null
	});

	return {
		subscribe,
		notify(cateSeq: number | null) {
			update((state) => ({
				version: state.version + 1,
				cateSeq
			}));
		}
	};
};

export const materialViewSync = createMaterialViewSync();
