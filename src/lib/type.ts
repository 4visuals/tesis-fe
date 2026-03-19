export type Thumbnail = {
	seq: number;
	generatedPath: string;
	originFileName: string;
	orderNum?: number;
	type?: string;
};

export type ContentFile = {
	seq: number;
	generatedPath: string;
	originFileName: string;
	type: 'FILE' | 'VIDEO' | string;
	orderNum?: number;
};

export type Category = {
	seq: number;
	categoryName: string;
	parent?: number;
	level?: number;
	items?: number;
	orderNum?: number;
	fullPath?: string;
	selectable?: boolean;
	sub?: Category[];
};

export type Owner = {
	seq?: number;
	userName: string;
	admin?: boolean;
};

export type User = {
	seq: number;
	userName: string;
	admin?: boolean;
};

export type Mention = {
	seq: number;
	mention: string;
	createdTime: number;
	writer: User;
};

export type Material = {
	seq: number;
	title: string;
	thumnails: Thumbnail[];
	contents: ContentFile[];
	mentionCnt?: number;
	orderNum?: number;
	creationDate?: number;
	category: Category;
	owner: Owner;
};

export type Bookmark = {
	materialSeq: number;
	userSeq?: number;
	bookmarkTime?: number;
};

export type Team = {
	seq: number;
	teamName?: string;
	project?: {
		seq: number;
		projectName?: string;
		projectCode?: string | null;
		category?: Category | null;
	};
	workingCategories: Category[];
};
