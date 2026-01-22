export type UserSummary = {
	seq: number;
	userName: string;
	userId: string;
	userEmail: string;
};

export type CategoryNode = {
	seq: number;
	categoryName: string;
	selectable?: boolean;
	sub?: CategoryNode[];
};

export type Team = {
	seq: number;
	teamName: string;
	members: UserSummary[];
	project: {
		seq: number;
		projectName: string;
		category: {
			seq: number;
			categoryName?: string;
			parent?: CategoryNode | null;
			level?: number;
			items?: number;
			orderNum?: number;
			fullPath?: string | null;
			sub?: CategoryNode[];
		} | null;
	};
	workingCategories: CategoryNode[];
};
