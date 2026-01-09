export type CategoryNode = {
	seq: number;
	level: number;
	categoryName: string;
	items?: number;
	sub?: CategoryNode[];
};
