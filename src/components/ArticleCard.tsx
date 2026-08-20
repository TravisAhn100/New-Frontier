import { Link } from 'react-router-dom'
import { getArticlePath, getSectionPath, siteConfig } from '../data/siteConfig'
import type { Article, ArticleLayout, EditionKey } from '../types/content'

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
  }).format(new Date(`${date}T12:00:00+09:00`))
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
  const articleImage = article.image ? (
    <img
      className="article-card__image"
      src={article.image}
      alt={article.imageAlt ?? ''}
      width="1200"
      height="675"
      loading={imagePriority ? 'eager' : 'lazy'}
      style={{ objectPosition: article.imagePosition ?? 'center' }}
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
        {article.summary && <p className="article-card__summary">{article.summary}</p>}
        <p className="article-card__meta">
          <span>{edition === 'korean' ? article.author : `By ${article.author}`}</span>
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
