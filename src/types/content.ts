export type EditionKey = 'international' | 'korean'

export type SectionKey = 'news' | 'culture' | 'opinion' | 'school' | 'info'

export type ArticleSection = Exclude<SectionKey, 'info'>

export type ArticleLayout = 'lead' | 'secondary' | 'standard' | 'brief'

export type ArticleStatus = 'draft' | 'published' | 'archived'

export type ArticleBlockType = 'paragraph' | 'heading' | 'quote' | 'image' | 'link'

export interface Topic {
  slug: string
  label: string
}

export interface ArticleAuthor {
  id: string
  name: string
}

interface TextArticleBlock {
  id: string
  type: 'paragraph' | 'heading' | 'quote'
  content: string
}

export interface ImageArticleBlock {
  id: string
  type: 'image'
  imageRef: string
  caption: string
  credit: string
  alt: string
}

export interface LinkArticleBlock {
  id: string
  type: 'link'
  content: string
  url: string
}

export type ArticleBlock = TextArticleBlock | ImageArticleBlock | LinkArticleBlock

export interface Article {
  id: string
  slug: string
  title: string
  subtitle: string
  edition: EditionKey
  section?: ArticleSection
  topics: Topic[]
  topicSlugs: string[]
  authors: ArticleAuthor[]
  primaryAuthorId: string
  coverImage?: string
  coverImageCaption: string
  coverImageCredit: string
  coverImageAlt: string
  coverImagePosition?: 'center' | 'top'
  body: ArticleBlock[]
  createdAt: string
  updatedAt: string
  publishedAt?: string
  status: ArticleStatus
  featured: boolean
  layout: ArticleLayout
}

export interface ArticleFilters {
  edition?: EditionKey
  status?: ArticleStatus
  publishedDate?: string
  topic?: string
  writer?: string
  section?: ArticleSection
}

export interface StoredImageAsset {
  id: string
  blob: Blob
  fileName: string
  contentType: string
  createdAt: string
}
