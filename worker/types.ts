export interface Env {
  ASSETS: Fetcher
  DB: D1Database
  ARTICLE_IMAGES: R2Bucket
  EDITORIAL_PASSWORD?: string
  EDITORIAL_SESSION_SECRET?: string
  EDITORIAL_SESSION_TTL_SECONDS?: string
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

export function jsonResponse(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers)
  headers.set('content-type', 'application/json; charset=utf-8')
  headers.set('cache-control', 'no-store')
  headers.set('x-content-type-options', 'nosniff')
  return new Response(JSON.stringify(data), { ...init, headers })
}
