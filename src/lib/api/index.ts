import type { Bookmark, Material, Mention, User } from '$lib/type';

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
	cate: { seq: number };
}>;

export type CategoryWithRecentResponse = ApiSuccess<{
	cate: Record<string, unknown>;
	materials: Material[];
}>;

export type MaterialsByCateResponse =
	| ApiSuccess<{ materials: Material[]; bookmarks: Bookmark[] }>
	| ApiFail;

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

	private async getJson<T>(path: string, options?: FetchOptions): Promise<T> {
		const response = await fetch(this.buildUrl(path, options?.baseUrl), {
			credentials: 'include',
			headers: {
				Accept: 'application/json; charset=utf-8'
			}
		});
		if (!response.ok) {
			throw new Error(`Request failed: ${response.status}`);
		}
		return response.json() as Promise<T>;
	}

	getProjectPage(projectCode: string, options?: FetchOptions): Promise<ProjectPageResponse> {
		return this.getJson<ProjectPageResponse>(`/projectPage/${projectCode}`, options);
	}

	getProjectCategory(projectSeq: number, options?: FetchOptions): Promise<ProjectCategoryResponse> {
		return this.getJson<ProjectCategoryResponse>(`/manager/${projectSeq}/category`, options);
	}

	getCategoryWithRecent(
		rootSeq: number,
		projectSeq: number,
		options?: FetchOptions
	): Promise<CategoryWithRecentResponse> {
		return this.getJson<CategoryWithRecentResponse>(
			`/manager/category/${rootSeq}/project/${projectSeq}`,
			options
		);
	}

	getMaterialsByCate(cateSeq: number, options?: FetchOptions): Promise<MaterialsByCateResponse> {
		return this.getJson<MaterialsByCateResponse>(`/materials/cate/${cateSeq}`, options);
	}

	toggleBookmark(materialSeq: number, options?: FetchOptions): Promise<ToggleBookmarkResponse> {
		const url = this.buildUrl(`/material/${materialSeq}/bookmark`, options?.baseUrl);
		return fetch(url, {
			method: 'POST',
			credentials: 'include',
			headers: {
				Accept: 'application/json; charset=utf-8'
			}
		}).then(async (response) => {
			if (!response.ok) {
				throw new Error(`Request failed: ${response.status}`);
			}
			return (await response.json()) as ToggleBookmarkResponse;
		});
	}

	getMentions(materialSeq: number, options?: FetchOptions): Promise<MentionsResponse> {
		return this.getJson<MentionsResponse>(`/mentions/${materialSeq}`, options);
	}

	writeMention(
		materialSeq: number,
		mention: string,
		options?: FetchOptions
	): Promise<WriteMentionResponse> {
		const url = this.buildUrl(`/mention`, options?.baseUrl);
		const body = new URLSearchParams({
			materialSeq: String(materialSeq),
			mention
		});
		return fetch(url, {
			method: 'POST',
			credentials: 'include',
			headers: {
				Accept: 'application/json; charset=utf-8',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			body
		}).then(async (response) => {
			if (!response.ok) {
				throw new Error(`Request failed: ${response.status}`);
			}
			return (await response.json()) as WriteMentionResponse;
		});
	}

	updateMention(
		mentionSeq: number,
		mention: string,
		options?: FetchOptions
	): Promise<UpdateMentionResponse> {
		const url = this.buildUrl(`/mention/edit`, options?.baseUrl);
		const body = new URLSearchParams({
			mentionSeq: String(mentionSeq),
			mention
		});
		return fetch(url, {
			method: 'POST',
			credentials: 'include',
			headers: {
				Accept: 'application/json; charset=utf-8',
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
			},
			body
		}).then(async (response) => {
			if (!response.ok) {
				throw new Error(`Request failed: ${response.status}`);
			}
			return (await response.json()) as UpdateMentionResponse;
		});
	}

	deleteMention(mentionSeq: number, options?: FetchOptions): Promise<DeleteMentionResponse> {
		const url = this.buildUrl(`/mention/${mentionSeq}`, options?.baseUrl);
		return fetch(url, {
			method: 'DELETE',
			credentials: 'include',
			headers: {
				Accept: 'application/json; charset=utf-8'
			}
		}).then(async (response) => {
			if (!response.ok) {
				throw new Error(`Request failed: ${response.status}`);
			}
			return (await response.json()) as DeleteMentionResponse;
		});
	}
}

export const tesisApi = new TesisApi();
