interface ApiErrorPayload {
  error?: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('accept', 'application/json')
  if (init.body && !(init.body instanceof FormData)) headers.set('content-type', 'application/json')

  let response: Response
  try {
    response = await fetch(path, { ...init, headers, credentials: 'include' })
  } catch {
    throw new ApiError('The server could not be reached. Check your connection and try again.', 0)
  }

  if (response.status === 204) return undefined as T

  const payload = await response.json() as T | ApiErrorPayload
  if (!response.ok) {
    const apiError = payload as ApiErrorPayload
    throw new ApiError(apiError.error || 'The server could not complete this request.', response.status)
  }
  return payload as T
}
