export type EditionKey = 'international' | 'korean'

export type SectionKey = 'news' | 'culture' | 'opinion' | 'school' | 'info'

export type ArticleLayout = 'lead' | 'secondary' | 'standard' | 'brief'

export interface Article {
  id: string
  slug: string
  edition: EditionKey
  section: Exclude<SectionKey, 'info'>
  title: string
  summary?: string
  image?: string
  imageAlt?: string
  author: string
  publishedAt: string
  featured?: boolean
  layout: ArticleLayout
}
