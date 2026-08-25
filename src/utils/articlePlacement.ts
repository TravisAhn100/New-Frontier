import type { Article, ArticlePlacement } from '../types/content'

export const articlePlacementOptions: Array<{ value: ArticlePlacement; label: string }> = [
  { value: 'headline', label: 'Headline' },
  { value: 'main', label: 'Main Article' },
  { value: 'homepage', label: 'Main Page Only' },
  { value: 'section', label: 'Section Page Only' },
]

const placementValues = articlePlacementOptions.map(({ value }) => value)

export function normalizeArticlePlacement(value: unknown, featured = false): ArticlePlacement {
  return placementValues.includes(value as ArticlePlacement)
    ? value as ArticlePlacement
    : featured ? 'headline' : 'main'
}

export function getArticlePlacement(article: Pick<Article, 'placement' | 'featured'>) {
  return normalizeArticlePlacement(article.placement, article.featured)
}

export function appearsOnHomepage(article: Pick<Article, 'placement' | 'featured'>) {
  return getArticlePlacement(article) !== 'section'
}

export function appearsOnSectionPage(article: Pick<Article, 'placement' | 'featured'>) {
  return getArticlePlacement(article) !== 'homepage'
}

export function compareHomepagePlacement(
  left: Pick<Article, 'placement' | 'featured'>,
  right: Pick<Article, 'placement' | 'featured'>,
) {
  const rank: Record<ArticlePlacement, number> = {
    headline: 0,
    main: 1,
    homepage: 2,
    section: 3,
  }
  return rank[getArticlePlacement(left)] - rank[getArticlePlacement(right)]
}
