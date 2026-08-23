import type {
  Article,
  ArticleBlock,
  ArticleBlockType,
  ArticleFilters,
  ArticleStatus,
  EditionKey,
  Topic,
} from '../types/content'
import { articleRepository } from './articleRepository'

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

export function slugify(value: string) {
  return value
    .normalize('NFKD')
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeTopic(value: string): Topic | undefined {
  const label = value.trim().replace(/\s+/g, ' ')
  const slug = slugify(label)

  if (!label || !slug) return undefined
  return { slug, label }
}

export function createArticleBlock(type: ArticleBlockType): ArticleBlock {
  const id = createId('block')

  if (type === 'image') {
    return { id, type, imageRef: '', caption: '', credit: '', alt: '' }
  }

  if (type === 'link') {
    return { id, type, content: '', url: '' }
  }

  return { id, type, content: '' }
}

export function createEmptyArticle(): Article {
  const now = new Date().toISOString()
  const id = createId('article')

  return {
    id,
    slug: `draft-${id.slice(-8)}`,
    title: '',
    subtitle: '',
    edition: 'international',
    section: 'news',
    topics: [],
    topicSlugs: [],
    authors: [{ id: '', name: '' }],
    primaryAuthorId: '',
    coverImageCaption: '',
    coverImageCredit: '',
    coverImageAlt: '',
    body: [createArticleBlock('paragraph')],
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    featured: false,
    layout: 'standard',
  }
}

function normalizeArticle(article: Article, status: ArticleStatus) {
  const now = new Date().toISOString()
  const primaryName = article.authors[0]?.name.trim() ?? ''
  const primaryAuthorId = slugify(primaryName) || article.primaryAuthorId || `author-${article.id}`
  const topics = article.topics.reduce<Topic[]>((normalized, topic) => {
    const nextTopic = normalizeTopic(topic.label)
    if (nextTopic && !normalized.some((item) => item.slug === nextTopic.slug)) normalized.push(nextTopic)
    return normalized
  }, [])

  return {
    ...article,
    slug: slugify(article.slug || article.title) || `draft-${article.id.slice(-8)}`,
    title: article.title.trim(),
    subtitle: article.subtitle.trim(),
    topics,
    topicSlugs: topics.map((topic) => topic.slug),
    authors: [{ id: primaryAuthorId, name: primaryName }, ...article.authors.slice(1)],
    primaryAuthorId,
    coverImageCaption: article.coverImageCaption.trim(),
    coverImageCredit: article.coverImageCredit.trim(),
    coverImageAlt: article.coverImageAlt.trim(),
    updatedAt: now,
    status,
  }
}

async function ensureUniqueSlug(article: Article) {
  const articles = await articleRepository.getAllArticles()
  const baseSlug = slugify(article.slug || article.title) || `article-${article.id.slice(-8)}`
  let slug = baseSlug
  let suffix = 2

  while (articles.some((item) => item.id !== article.id && item.edition === article.edition && item.slug === slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return slug
}

function hasMeaningfulBody(blocks: ArticleBlock[]) {
  return blocks.some((block) => {
    if (block.type === 'image') return Boolean(block.imageRef)
    if (block.type === 'link') return Boolean(block.content.trim() && block.url.trim())
    return Boolean(block.content.trim())
  })
}

export function isSafeArticleLink(value: string) {
  const trimmed = value.trim()
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return true

  try {
    const url = new URL(trimmed)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const articleService = {
  createArticle: createEmptyArticle,

  async getArticles(filters: ArticleFilters = {}) {
    const articles = await articleRepository.getAllArticles()
    const writerQuery = filters.writer?.trim().toLowerCase()

    return articles
      .filter((article) => !filters.edition || article.edition === filters.edition)
      .filter((article) => !filters.status || article.status === filters.status)
      .filter((article) => !filters.section || article.section === filters.section)
      .filter((article) => !filters.publishedDate || article.publishedAt?.slice(0, 10) === filters.publishedDate)
      .filter((article) => !filters.topic || article.topicSlugs.includes(filters.topic))
      .filter((article) => !writerQuery || article.authors.some((author) => author.name.toLowerCase().includes(writerQuery)))
      .sort((left, right) => {
        const leftDate = left.publishedAt ?? left.updatedAt
        const rightDate = right.publishedAt ?? right.updatedAt
        return rightDate.localeCompare(leftDate)
      })
  },

  getArticle(id: string) {
    return articleRepository.getArticle(id)
  },

  async getArticleBySlug(edition: EditionKey, slug: string) {
    const articles = await articleRepository.getAllArticles()
    return articles.find((article) => (
      article.edition === edition
      && article.status === 'published'
      && article.slug === slug
    ))
  },

  async saveDraft(article: Article) {
    const normalized = normalizeArticle(article, article.status === 'published' ? 'published' : 'draft')
    normalized.slug = await ensureUniqueSlug(normalized)
    return articleRepository.saveArticle(normalized)
  },

  async publishArticle(article: Article) {
    const normalized = normalizeArticle(article, 'published')
    const errors: string[] = []

    if (!normalized.title) errors.push('Headline is required.')
    if (!normalized.section) errors.push('Section is required.')
    if (!normalized.authors[0]?.name) errors.push('Author is required.')
    if (!hasMeaningfulBody(normalized.body)) errors.push('Article body is required.')
    if (normalized.body.some((block) => block.type === 'link' && block.url && !isSafeArticleLink(block.url))) {
      errors.push('Links must use an internal path or a valid http/https URL.')
    }

    if (errors.length > 0) throw new Error(errors.join(' '))

    normalized.slug = await ensureUniqueSlug({ ...normalized, slug: slugify(normalized.slug || normalized.title) })
    normalized.publishedAt = normalized.publishedAt?.length === 10
      ? `${normalized.publishedAt}T09:00:00+09:00`
      : normalized.publishedAt
    return articleRepository.saveArticle(normalized)
  },

  async updateArticle(article: Article) {
    const normalized = normalizeArticle(article, article.status)
    normalized.slug = await ensureUniqueSlug(normalized)
    return articleRepository.saveArticle(normalized)
  },

  async deleteArticle(id: string) {
    await articleRepository.deleteArticle(id)
  },
}
