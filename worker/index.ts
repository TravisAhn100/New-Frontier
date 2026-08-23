import { handleArticleRequest } from './articles'
import { handleAuthRequest, requireEditorialRequest } from './auth'
import { Env, HttpError, jsonResponse } from './types'

const MAX_IMAGE_BYTES = 10 * 1024 * 1024

function safeFileName(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'image'
}

async function handleUpload(request: Request, env: Env) {
  await requireEditorialRequest(request, env)
  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File) || !file.type.startsWith('image/')) {
    throw new HttpError(400, 'Please choose an image file.')
  }
  if (file.size > MAX_IMAGE_BYTES) throw new HttpError(413, 'Images must be smaller than 10 MB.')

  const key = `article-images/${crypto.randomUUID()}-${safeFileName(file.name)}`
  await env.ARTICLE_IMAGES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalFileName: file.name },
  })
  return jsonResponse({ key, url: `/api/images/${encodeURIComponent(key)}` }, { status: 201 })
}

async function handleImage(request: Request, env: Env, key: string) {
  if (request.method !== 'GET' && request.method !== 'HEAD') throw new HttpError(405, 'Method not allowed.')
  const object = await env.ARTICLE_IMAGES.get(key)
  if (!object) throw new HttpError(404, 'Image not found.')

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('cache-control', 'public, max-age=31536000, immutable')
  headers.set('x-content-type-options', 'nosniff')
  return new Response(request.method === 'HEAD' ? null : object.body, { headers })
}

async function handleApi(request: Request, env: Env) {
  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/auth/')) return handleAuthRequest(request, env)
  if (url.pathname === '/api/uploads' && request.method === 'POST') return handleUpload(request, env)
  if (url.pathname.startsWith('/api/images/')) {
    const encodedKey = url.pathname.slice('/api/images/'.length)
    let key = ''
    try {
      key = decodeURIComponent(encodedKey)
    } catch {
      throw new HttpError(400, 'Invalid image key.')
    }
    if (!key.startsWith('article-images/')) throw new HttpError(404, 'Image not found.')
    return handleImage(request, env, key)
  }
  if (url.pathname.startsWith('/api/articles')) return handleArticleRequest(request, env)
  throw new HttpError(404, 'API route not found.')
}

export default {
  async fetch(request, env): Promise<Response> {
    try {
      const url = new URL(request.url)
      if (url.pathname.startsWith('/api/')) return await handleApi(request, env)
      return env.ASSETS.fetch(request)
    } catch (error) {
      if (error instanceof HttpError) return jsonResponse({ error: error.message }, { status: error.status })
      console.error('Unhandled New Frontier API error', error)
      const message = error instanceof Error && /UNIQUE constraint failed/.test(error.message)
        ? 'That article slug is already in use for this edition.'
        : 'The server could not complete this request.'
      const status = message.startsWith('That article slug') ? 409 : 500
      return jsonResponse({ error: message }, { status })
    }
  },
} satisfies ExportedHandler<Env>
