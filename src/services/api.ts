import type { ApiResponse, User } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}

export const userService = {
  getUsers: () => fetchApi<User[]>('/users'),
  getUser: (id: string) => fetchApi<User>(`/users/${id}`),
  createUser: (user: Omit<User, 'id' | 'createdAt'>) =>
    fetchApi<User>('/users', {
      method: 'POST',
      body: JSON.stringify(user),
    }),
}
