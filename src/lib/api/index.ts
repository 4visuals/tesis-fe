import type { Bookmark, Category, ContentFile, Material, Mention, Team, Thumbnail, User } from '$lib/type';

type FetchOptions = {
	baseUrl?: string;
};

export type ApiSuccess<T extends Record<string, unknown> = Record<string, unknown>> = {
	success: true;
} & T;

export type ApiFail = {
	success: false;
	message?: string;
};

export type ProjectPageResponse =
	| ApiSuccess<{ projectSeq: number; user: string }>
	| ApiFail;

export type ProjectCategoryResponse = ApiSuccess<{
	cate: Category;
}>;

export type CategoryWithRecentResponse = ApiSuccess<{
	cate: Category;
	materials: Material[];
}>;

export type MaterialsByCateResponse =
	| ApiSuccess<{ materials: Material[]; bookmarks: Bookmark[] }>
	| ApiFail;

export type EditableMaterialsResponse =
	| ApiSuccess<{ materials: Material[] }>
	| ApiFail;

export type UserTeamsResponse = ApiSuccess<{ teams: Team[] }>;

export type CategoryCreateResponse = ApiSuccess<{ cate: Category }>;

export type CategoryReorderResponse = ApiSuccess<{ parent: Category }>;

export type MaterialResponse = ApiSuccess<{ material: Material }>;

export type AppendFilesResponse = ApiSuccess<{ files: Array<Thumbnail | ContentFile> }>;

export type DeleteFileResponse = ApiSuccess<{ file: Thumbnail | ContentFile }>;

export type BasicSuccessResponse = ApiSuccess<Record<string, never>> | ApiFail;

export type ToggleBookmarkResponse = ApiSuccess<{ bookmarked: boolean }>;

export type MentionsResponse = ApiSuccess<{ mentions: Mention[]; me: User }>;

export type WriteMentionResponse = ApiSuccess<{ mention: Mention }>;

export type UpdateMentionResponse = ApiSuccess<{ mention: Mention }>;

export type DeleteMentionResponse = ApiSuccess<{ mention: Mention }>;

export class TesisApi {
	private defaultBaseUrl = import.meta.env.VITE_API_BASE ?? '';

	private buildUrl(path: string, baseUrl?: string) {
		return `${baseUrl ?? this.defaultBaseUrl}${path}`;
	}

	private async requestJson<T>(
		path: string,
		init?: RequestInit,
		options?: FetchOptions
	): Promise<T> {
		const response = await fetch(this.buildUrl(path, options?.baseUrl), {
			credentials: 'include',
			headers: {
				Accept: 'application/json; charset=utf-8',
				...(init?.headers ?? {})
			},
			...init
		});
		if (!response.ok) {
			throw new Error(`Request failed: ${response.status}`);
		}
		return response.json() as Promise<T>;
	}

	private postForm<T>(
		path: string,
		data: Record<string, string | number>,
		options?: FetchOptions
	): Promise<T> {
		return this.requestJson<T>(
			path,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
				},
				body: new URLSearchParams(
					Object.entries(data).reduce<Record<string, string>>((acc, [key, value]) => {
						acc[key] = String(value);
						return acc;
					}, {})
				)
			},
			options
		);
	}

	private postFormData<T>(path: string, body: FormData, options?: FetchOptions): Promise<T> {
		return this.requestJson<T>(
			path,
			{
				method: 'POST',
				body
			},
			options
		);
	}

	getProjectPage(projectCode: string, options?: FetchOptions): Promise<ProjectPageResponse> {
		return this.requestJson<ProjectPageResponse>(`/projectPage/${projectCode}`, undefined, options);
	}

	getProjectCategory(projectSeq: number, options?: FetchOptions): Promise<ProjectCategoryResponse> {
		return this.requestJson<ProjectCategoryResponse>(`/manager/${projectSeq}/category`, undefined, options);
	}

	getCategoryWithRecent(
		rootSeq: number,
		projectSeq: number,
		options?: FetchOptions
	): Promise<CategoryWithRecentResponse> {
		return this.requestJson<CategoryWithRecentResponse>(
			`/manager/category/${rootSeq}/project/${projectSeq}`,
			undefined,
			options
		);
	}

	getMaterialsByCate(cateSeq: number, options?: FetchOptions): Promise<MaterialsByCateResponse> {
		return this.requestJson<MaterialsByCateResponse>(`/materials/cate/${cateSeq}`, undefined, options);
	}

	getEditableMaterialsByCate(
		cateSeq: number,
		options?: FetchOptions
	): Promise<EditableMaterialsResponse> {
		return this.requestJson<EditableMaterialsResponse>(
			`/materials/cate/${cateSeq}/my`,
			undefined,
			options
		);
	}

	getUserTeams(options?: FetchOptions): Promise<UserTeamsResponse> {
		return this.requestJson<UserTeamsResponse>(`/user/teams`, undefined, options);
	}

	toggleBookmark(materialSeq: number, options?: FetchOptions): Promise<ToggleBookmarkResponse> {
		return this.requestJson<ToggleBookmarkResponse>(
			`/material/${materialSeq}/bookmark`,
			{ method: 'POST' },
			options
		);
	}

	getMentions(materialSeq: number, options?: FetchOptions): Promise<MentionsResponse> {
		return this.requestJson<MentionsResponse>(`/mentions/${materialSeq}`, undefined, options);
	}

	writeMention(
		materialSeq: number,
		mention: string,
		options?: FetchOptions
	): Promise<WriteMentionResponse> {
		return this.postForm<WriteMentionResponse>(
			`/mention`,
			{
				materialSeq,
				mention
			},
			options
		);
	}

	updateMention(
		mentionSeq: number,
		mention: string,
		options?: FetchOptions
	): Promise<UpdateMentionResponse> {
		return this.postForm<UpdateMentionResponse>(
			`/mention/edit`,
			{
				mentionSeq,
				mention
			},
			options
		);
	}

	deleteMention(mentionSeq: number, options?: FetchOptions): Promise<DeleteMentionResponse> {
		return this.requestJson<DeleteMentionResponse>(
			`/mention/${mentionSeq}`,
			{ method: 'DELETE' },
			options
		);
	}

	createCategory(parent: number, name: string, options?: FetchOptions): Promise<CategoryCreateResponse> {
		return this.postForm<CategoryCreateResponse>(`/manager/category`, { parent, name }, options);
	}

	renameCategory(cate: number, name: string, options?: FetchOptions): Promise<BasicSuccessResponse> {
		return this.postForm<BasicSuccessResponse>(`/manager/category/rename`, { cate, name }, options);
	}

	deleteCategory(cate: number, options?: FetchOptions): Promise<BasicSuccessResponse> {
		return this.postForm<BasicSuccessResponse>(`/manager/category/delete`, { cate }, options);
	}

	reorderCategory(
		cateSeq: number,
		dir: 'up' | 'down',
		options?: FetchOptions
	): Promise<CategoryReorderResponse> {
		return this.requestJson<CategoryReorderResponse>(
			`/manager/category/${cateSeq}/${dir}`,
			{ method: 'PUT' },
			options
		);
	}

	uploadMaterial(
		title: string,
		cate: number,
		thumnails: File[],
		contents: File[],
		options?: FetchOptions
	): Promise<BasicSuccessResponse> {
		const form = new FormData();
		form.append('title', title);
		form.append('cate', String(cate));
		thumnails.forEach((file) => form.append('thumnails', file));
		contents.forEach((file) => form.append('contents', file));
		return this.postFormData<BasicSuccessResponse>(`/manager/material/up`, form, options);
	}

	uploadVideo(
		title: string,
		cate: number,
		videoUrl: string,
		options?: FetchOptions
	): Promise<MaterialResponse> {
		return this.postForm<MaterialResponse>(`/manager/material/up/video`, { title, cate, videoUrl }, options);
	}

	updateMaterial(
		mSeq: number,
		prop: string,
		value: string | number,
		options?: FetchOptions
	): Promise<MaterialResponse> {
		return this.postForm<MaterialResponse>(`/manager/material/edit`, { mSeq, prop, value }, options);
	}

	deleteUpfile(fileSeq: number, options?: FetchOptions): Promise<DeleteFileResponse> {
		return this.postForm<DeleteFileResponse>(`/manager/upfile/delete`, { fileSeq }, options);
	}

	appendMaterialFiles(
		mseq: number,
		files: File[],
		options?: FetchOptions
	): Promise<AppendFilesResponse> {
		const form = new FormData();
		files.forEach((file) => form.append('files', file));
		return this.postFormData<AppendFilesResponse>(`/manager/material/${mseq}/files`, form, options);
	}

	deleteMaterial(mSeq: number, options?: FetchOptions): Promise<MaterialResponse> {
		return this.postForm<MaterialResponse>(`/manager/material/del`, { mSeq }, options);
	}

	reorderMaterialThumbnails(
		mSeq: number,
		start: number,
		end: number,
		options?: FetchOptions
	): Promise<MaterialResponse> {
		return this.postForm<MaterialResponse>(`/manager/material/${mSeq}/ordering`, { start, end }, options);
	}

	reorderCategoryMaterials(
		cateSeq: number,
		srcOrder: number,
		dstOrder: number,
		options?: FetchOptions
	): Promise<BasicSuccessResponse> {
		return this.postForm<BasicSuccessResponse>(
			`/manager/category/${cateSeq}/ordering`,
			{ srcOrder, dstOrder },
			options
		);
	}
}

export const tesisApi = new TesisApi();
