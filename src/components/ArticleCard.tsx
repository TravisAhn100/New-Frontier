import { Link } from 'react-router-dom'
import { getArticlePath, getSectionPath, siteConfig } from '../data/siteConfig'
import type { Article, ArticleLayout, EditionKey } from '../types/content'
import ResolvedImage from './ResolvedImage'

interface ArticleCardProps {
  article: Article
  edition: EditionKey
  variant?: ArticleLayout
  imagePriority?: boolean
}

function formatArticleDate(date: string, edition: EditionKey) {
  return new Intl.DateTimeFormat(siteConfig[edition].dateLocale, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(date.length === 10 ? `${date}T12:00:00+09:00` : date))
}

export default function ArticleCard({
  article,
  edition,
  variant = article.layout,
  imagePriority = false,
}: ArticleCardProps) {
  const config = siteConfig[edition]
  const sectionPath = article.section ? getSectionPath(edition, article.section) : undefined
  const articlePath = article.slug ? getArticlePath(edition, article.slug) : undefined
  const className = `article-card article-card--${variant}`
  const primaryAuthor = article.authors.find((author) => author.id === article.primaryAuthorId) ?? article.authors[0]
  const articleImage = article.coverImage ? (
    <ResolvedImage
      className="article-card__image"
      reference={article.coverImage}
      alt={article.coverImageAlt}
      width="1200"
      height="675"
      loading={imagePriority ? 'eager' : 'lazy'}
      style={{ objectPosition: article.coverImagePosition ?? 'center' }}
    />
  ) : null

  return (
    <article className={className}>
      {articleImage && variant !== 'brief' && (
        articlePath ? (
          <Link className="article-card__image-link" to={articlePath} aria-label={article.title}>
            {articleImage}
          </Link>
        ) : (
          <div className="article-card__image-link">{articleImage}</div>
        )
      )}

      <div className="article-card__content">
        {article.section && sectionPath && (
          <Link className="article-card__section" to={sectionPath}>
            {config.navigation[article.section]}
          </Link>
        )}
        <h2 className="article-card__headline">
          {articlePath ? <Link to={articlePath}>{article.title}</Link> : article.title}
        </h2>
        {article.subtitle && <p className="article-card__summary">{article.subtitle}</p>}
        <p className="article-card__meta">
          <span>{edition === 'korean' ? primaryAuthor?.name : `By ${primaryAuthor?.name ?? ''}`}</span>
          {article.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt, edition)}</time>
            </>
          )}
        </p>
      </div>
    </article>
  )
}
