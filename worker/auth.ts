import { Env, HttpError, jsonResponse } from './types'

const COOKIE_NAME = 'nf_editor_session'
const DEFAULT_SESSION_TTL_SECONDS = 8 * 60 * 60
const encoder = new TextEncoder()

function base64Url(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  return base64Url(new Uint8Array(signature))
}

function cookieValue(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const prefix = `${COOKIE_NAME}=`
  return cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length)
}

function sessionTtl(env: Env) {
  const configured = Number(env.EDITORIAL_SESSION_TTL_SECONDS)
  return Number.isFinite(configured) && configured > 0
    ? Math.floor(configured)
    : DEFAULT_SESSION_TTL_SECONDS
}

export async function isEditorialRequest(request: Request, env: Env) {
  if (!env.EDITORIAL_SESSION_SECRET) return false
  const token = cookieValue(request)
  if (!token) return false
  const separator = token.indexOf('.')
  if (separator < 1) return false

  const expiresAt = token.slice(0, separator)
  const suppliedSignature = token.slice(separator + 1)
  if (!/^\d+$/.test(expiresAt) || Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false

  const expectedSignature = await sign(expiresAt, env.EDITORIAL_SESSION_SECRET)
  if (suppliedSignature.length !== expectedSignature.length) return false

  let difference = 0
  for (let index = 0; index < suppliedSignature.length; index += 1) {
    difference |= suppliedSignature.charCodeAt(index) ^ expectedSignature.charCodeAt(index)
  }
  return difference === 0
}

export async function requireEditorialRequest(request: Request, env: Env) {
  if (!await isEditorialRequest(request, env)) throw new HttpError(401, 'Editorial authentication is required.')

  const origin = request.headers.get('origin')
  if (origin && origin !== new URL(request.url).origin) {
    throw new HttpError(403, 'Cross-origin editorial requests are not allowed.')
  }
}

export async function handleAuthRequest(request: Request, env: Env) {
  const url = new URL(request.url)

  if (url.pathname === '/api/auth/session' && request.method === 'GET') {
    return jsonResponse({ authenticated: await isEditorialRequest(request, env) })
  }

  if (url.pathname === '/api/auth/login' && request.method === 'POST') {
    if (!env.EDITORIAL_PASSWORD || !env.EDITORIAL_SESSION_SECRET) {
      throw new HttpError(503, 'Editorial authentication has not been configured on the server.')
    }

    const body = await request.json<{ password?: unknown }>()
    if (typeof body.password !== 'string' || body.password !== env.EDITORIAL_PASSWORD) {
      throw new HttpError(401, 'Password is incorrect.')
    }

    const ttl = sessionTtl(env)
    const expiresAt = Math.floor(Date.now() / 1000) + ttl
    const token = `${expiresAt}.${await sign(String(expiresAt), env.EDITORIAL_SESSION_SECRET)}`
    const secure = url.protocol === 'https:' ? '; Secure' : ''
    return jsonResponse(
      { authenticated: true },
      {
        headers: {
          'set-cookie': `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${ttl}${secure}`,
        },
      },
    )
  }

  if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
    return jsonResponse(
      { authenticated: false },
      {
        headers: {
          'set-cookie': `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`,
        },
      },
    )
  }

  throw new HttpError(404, 'API route not found.')
}
