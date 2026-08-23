import { internationalArticles, koreanArticles } from '../src/data/articles'
import type {
  Article,
  ArticleAuthor,
  ArticleBlock,
  ArticleLayout,
  ArticleSection,
  ArticleStatus,
  EditionKey,
  Topic,
} from '../src/types/content'
import { isEditorialRequest, requireEditorialRequest } from './auth'
import { Env, HttpError, jsonResponse } from './types'

interface ArticleRow {
  id: string
  slug: string
  title: string
  subtitle: string
  edition: EditionKey
  section: ArticleSection | null
  topics_json: string
  topic_slugs_json: string
  authors_json: string
  primary_author_id: string
  cover_image: string | null
  cover_image_caption: string
  cover_image_credit: string
  cover_image_alt: string
  cover_image_position: 'center' | 'top' | null
  body_json: string
  created_at: string
  updated_at: string
  published_at: string | null
  status: ArticleStatus
  featured: number
  layout: ArticleLayout
}

const editions: EditionKey[] = ['international', 'korean']
const sections: ArticleSection[] = ['news', 'culture', 'opinion', 'school']
const statuses: ArticleStatus[] = ['draft', 'published', 'archived']
const layouts: ArticleLayout[] = ['lead', 'secondary', 'standard', 'brief']
const seedVersion = 'baseline-articles-v1'

function parseJson<T>(value: string, fallback: T) {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function rowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    edition: row.edition,
    section: row.section ?? undefined,
    topics: parseJson<Topic[]>(row.topics_json, []),
    topicSlugs: parseJson<string[]>(row.topic_slugs_json, []),
    authors: parseJson<ArticleAuthor[]>(row.authors_json, []),
    primaryAuthorId: row.primary_author_id,
    coverImage: row.cover_image ?? undefined,
    coverImageCaption: row.cover_image_caption,
    coverImageCredit: row.cover_image_credit,
    coverImageAlt: row.cover_image_alt,
    coverImagePosition: row.cover_image_position ?? undefined,
    body: parseJson<ArticleBlock[]>(row.body_json, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at ?? undefined,
    status: row.status,
    featured: Boolean(row.featured),
    layout: row.layout,
  }
}

function insertStatement(database: D1Database, article: Article, ignoreExisting = false) {
  const conflict = ignoreExisting ? 'OR IGNORE' : ''
  const updateExisting = ignoreExisting ? '' : `
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      title = excluded.title,
      subtitle = excluded.subtitle,
      edition = excluded.edition,
      section = excluded.section,
      topics_json = excluded.topics_json,
      topic_slugs_json = excluded.topic_slugs_json,
      authors_json = excluded.authors_json,
      primary_author_id = excluded.primary_author_id,
      cover_image = excluded.cover_image,
      cover_image_caption = excluded.cover_image_caption,
      cover_image_credit = excluded.cover_image_credit,
      cover_image_alt = excluded.cover_image_alt,
      cover_image_position = excluded.cover_image_position,
      body_json = excluded.body_json,
      updated_at = excluded.updated_at,
      published_at = excluded.published_at,
      status = excluded.status,
      featured = excluded.featured,
      layout = excluded.layout
  `
  return database.prepare(`
    INSERT ${conflict} INTO articles (
      id, slug, title, subtitle, edition, section,
      topics_json, topic_slugs_json, authors_json, primary_author_id,
      cover_image, cover_image_caption, cover_image_credit, cover_image_alt, cover_image_position,
      body_json, created_at, updated_at, published_at, status, featured, layout
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ${updateExisting}
  `).bind(
    article.id,
    article.slug,
    article.title,
    article.subtitle,
    article.edition,
    article.section ?? null,
    JSON.stringify(article.topics),
    JSON.stringify(article.topicSlugs),
    JSON.stringify(article.authors),
    article.primaryAuthorId,
    article.coverImage ?? null,
    article.coverImageCaption,
    article.coverImageCredit,
    article.coverImageAlt,
    article.coverImagePosition ?? null,
    JSON.stringify(article.body),
    article.createdAt,
    article.updatedAt,
    article.publishedAt ?? null,
    article.status,
    article.featured ? 1 : 0,
    article.layout,
  )
}

async function ensureSeedArticles(env: Env) {
  const seeded = await env.DB.prepare('SELECT value FROM app_metadata WHERE key = ?')
    .bind(seedVersion)
    .first<{ value: string }>()
  if (seeded) return

  const statements = [...internationalArticles, ...koreanArticles]
    .map((article) => insertStatement(env.DB, article, true))
  statements.push(
    env.DB.prepare('INSERT OR REPLACE INTO app_metadata (key, value) VALUES (?, ?)')
      .bind(seedVersion, new Date().toISOString()),
  )
  await env.DB.batch(statements)
}

async function getArticleById(env: Env, id: string) {
  const row = await env.DB.prepare('SELECT * FROM articles WHERE id = ?')
    .bind(id)
    .first<ArticleRow>()
  return row ? rowToArticle(row) : undefined
}

function slugify(value: string) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isSafeLink(value: string) {
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function normalizeString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim() : fallback
}

function normalizeArticle(input: unknown, id: string, existing?: Article): Article {
  if (!input || typeof input !== 'object') throw new HttpError(400, 'Article data is required.')
  const candidate = input as Partial<Article>
  const now = new Date().toISOString()
  const edition = editions.includes(candidate.edition as EditionKey) ? candidate.edition as EditionKey : 'international'
  const section = sections.includes(candidate.section as ArticleSection) ? candidate.section as ArticleSection : undefined
  const status = statuses.includes(candidate.status as ArticleStatus) ? candidate.status as ArticleStatus : 'draft'
  const layout = layouts.includes(candidate.layout as ArticleLayout) ? candidate.layout as ArticleLayout : 'standard'
  const title = normalizeString(candidate.title)
  const slug = slugify(normalizeString(candidate.slug) || title) || `draft-${id.slice(-8)}`
  const topics = Array.isArray(candidate.topics)
    ? candidate.topics
      .filter((topic): topic is Topic => Boolean(topic && typeof topic.label === 'string'))
      .map((topic) => ({ label: normalizeString(topic.label), slug: slugify(topic.slug || topic.label) }))
      .filter((topic) => topic.label && topic.slug)
    : []
  const authors = Array.isArray(candidate.authors)
    ? candidate.authors
      .filter((author): author is ArticleAuthor => Boolean(author && typeof author.name === 'string'))
      .map((author) => ({ name: normalizeString(author.name), id: slugify(author.id || author.name) }))
    : []
  const body = Array.isArray(candidate.body) ? candidate.body as ArticleBlock[] : []
  const primaryAuthorId = slugify(candidate.primaryAuthorId || authors[0]?.id || authors[0]?.name || '')
  const requestedPublishedAt = normalizeString(candidate.publishedAt) || existing?.publishedAt
  const publishedAt = status === 'published'
    ? requestedPublishedAt || now
    : requestedPublishedAt || undefined

  if (status === 'published') {
    const meaningfulBody = body.some((block) => {
      if (block.type === 'image') return Boolean(block.imageRef)
      return Boolean('content' in block && normalizeString(block.content))
    })
    if (!title) throw new HttpError(400, 'Headline is required.')
    if (!section) throw new HttpError(400, 'Section is required.')
    if (!authors[0]?.name) throw new HttpError(400, 'Author is required.')
    if (!meaningfulBody) throw new HttpError(400, 'Article body is required.')
  }

  if (body.some((block) => block.type === 'link' && block.url && !isSafeLink(block.url))) {
    throw new HttpError(400, 'Links must use an internal path or a valid http/https URL.')
  }

  return {
    id,
    slug,
    title,
    subtitle: normalizeString(candidate.subtitle),
    edition,
    section,
    topics,
    topicSlugs: topics.map((topic) => topic.slug),
    authors: authors.length > 0 ? authors : [{ id: '', name: '' }],
    primaryAuthorId,
    coverImage: normalizeString(candidate.coverImage) || undefined,
    coverImageCaption: normalizeString(candidate.coverImageCaption),
    coverImageCredit: normalizeString(candidate.coverImageCredit),
    coverImageAlt: normalizeString(candidate.coverImageAlt),
    coverImagePosition: candidate.coverImagePosition === 'top' ? 'top' : candidate.coverImagePosition === 'center' ? 'center' : undefined,
    body,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    publishedAt,
    status,
    featured: Boolean(candidate.featured),
    layout,
  }
}

function imageKeys(article: Article) {
  const references = [
    article.coverImage,
    ...article.body
      .filter((block) => block.type === 'image')
      .map((block) => block.imageRef),
  ]
  return [...new Set(references.flatMap((reference) => {
    if (!reference?.startsWith('/api/images/')) return []
    try {
      return [decodeURIComponent(reference.slice('/api/images/'.length))]
    } catch {
      return []
    }
  }))]
}

async function cleanUnreferencedImages(env: Env, article: Article) {
  await Promise.all(imageKeys(article).map(async (key) => {
    const reference = `/api/images/${encodeURIComponent(key)}`
    const result = await env.DB.prepare(`
      SELECT COUNT(*) AS count
      FROM articles
      WHERE cover_image = ? OR instr(body_json, ?) > 0
    `).bind(reference, reference).first<{ count: number }>()
    if (Number(result?.count ?? 0) === 0) await env.ARTICLE_IMAGES.delete(key)
  }))
}

export async function handleArticleRequest(request: Request, env: Env) {
  await ensureSeedArticles(env)
  const url = new URL(request.url)

  if (url.pathname === '/api/articles' && request.method === 'GET') {
    const editorial = url.searchParams.get('scope') === 'editorial'
      && await isEditorialRequest(request, env)
    const query = editorial
      ? 'SELECT * FROM articles ORDER BY COALESCE(published_at, updated_at) DESC'
      : "SELECT * FROM articles WHERE status = 'published' ORDER BY COALESCE(published_at, updated_at) DESC"
    const result = await env.DB.prepare(query).all<ArticleRow>()
    return jsonResponse(result.results.map(rowToArticle))
  }

  const slugPrefix = '/api/articles/slug/'
  if (url.pathname.startsWith(slugPrefix) && request.method === 'GET') {
    const slug = decodeURIComponent(url.pathname.slice(slugPrefix.length))
    const edition = url.searchParams.get('edition')
    const row = await env.DB.prepare(`
      SELECT * FROM articles
      WHERE slug = ? AND edition = ? AND status = 'published'
    `).bind(slug, edition).first<ArticleRow>()
    if (!row) throw new HttpError(404, 'Article not found.')
    return jsonResponse(rowToArticle(row))
  }

  if (url.pathname === '/api/articles' && request.method === 'POST') {
    await requireEditorialRequest(request, env)
    const input = await request.json<Partial<Article>>()
    const id = normalizeString(input.id) || `article-${crypto.randomUUID()}`
    const article = normalizeArticle(input, id)
    await insertStatement(env.DB, article).run()
    return jsonResponse(article, { status: 201 })
  }

  const articlePrefix = '/api/articles/'
  if (url.pathname.startsWith(articlePrefix)) {
    const id = decodeURIComponent(url.pathname.slice(articlePrefix.length))
    if (!id || id.includes('/')) throw new HttpError(404, 'Article not found.')
    const existing = await getArticleById(env, id)

    if (request.method === 'GET') {
      if (!existing) throw new HttpError(404, 'Article not found.')
      if (existing.status !== 'published') await requireEditorialRequest(request, env)
      return jsonResponse(existing)
    }

    if (request.method === 'PUT') {
      await requireEditorialRequest(request, env)
      const article = normalizeArticle(await request.json<Partial<Article>>(), id, existing)
      await insertStatement(env.DB, article).run()
      return jsonResponse(article, { status: existing ? 200 : 201 })
    }

    if (request.method === 'DELETE') {
      await requireEditorialRequest(request, env)
      if (!existing) throw new HttpError(404, 'Article not found.')
      await env.DB.prepare('DELETE FROM articles WHERE id = ?').bind(id).run()
      await cleanUnreferencedImages(env, existing)
      return new Response(null, { status: 204 })
    }
  }

  throw new HttpError(404, 'API route not found.')
}
