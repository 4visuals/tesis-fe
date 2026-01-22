export type Thumbnail = {
	generatedPath: string;
	originFileName: string;
};

export type ContentFile = {
	generatedPath: string;
	originFileName: string;
	type: 'FILE' | 'VIDEO' | string;
};

export type Category = {
	categoryName: string;
	fullPath?: string;
};

export type Owner = {
	seq?: number;
	userName: string;
};

export type User = {
	seq: number;
	userName: string;
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
	category: Category;
	owner: Owner;
};

export type Bookmark = {
	materialSeq: number;
};
