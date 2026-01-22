import type { PageLoad } from './$types'

type UserSummary = {
  seq: number
  userName: string
  userId: string
  userEmail: string
  admin: boolean
  userPhone: string | null
  password: string | null
  joinDate: string | null
}

type CategoryNode = {
  seq: number
  categoryName: string
  parent: CategoryNode | null
  level: number
  items: number
  orderNum: number
  fullPath: string | null
  selectable?: boolean
  sub?: CategoryNode[]
}

type Team = {
  seq: number
  teamName: string
  members: UserSummary[]
  project: {
    seq: number
    projectName: string
    projectCode: string | null
    category: {
      seq: number
      categoryName: string
      parent: CategoryNode | null
      level: number
      items: number
      orderNum: number
      fullPath: string | null
      sub: CategoryNode[]
    } | null
  }
  workingCategories: CategoryNode[]
}

type TeamsResponse = {
  success: boolean
  teams: Team[]
  users: UserSummary[]
  message?: string
}

const baseUrl = import.meta.env.VITE_API_BASE ?? ''

const buildUrl = (path: string) => `${baseUrl}${path}`

const requestJson = async <T>(fetchFn: typeof fetch, path: string): Promise<T> => {
  const response = await fetchFn(buildUrl(path), {
    credentials: 'include',
    headers: {
      Accept: 'application/json; charset=utf-8'
    }
  })
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export const load: PageLoad = async ({ fetch }) => {
  try {
    const res = await requestJson<TeamsResponse>(fetch, '/admin/search/teams')
    if (res.success) {
      return {
        teams: res.teams ?? [],
        users: res.users ?? [],
        loadError: '',
        loadingTeams: false
      }
    }
    return {
      teams: [],
      users: [],
      loadError: res.message ?? '팀 정보를 불러오지 못했습니다.',
      loadingTeams: false
    }
  } catch (error) {
    return {
      teams: [],
      users: [],
      loadError: error instanceof Error ? error.message : '팀 정보를 불러오지 못했습니다.',
      loadingTeams: false
    }
  }
}
