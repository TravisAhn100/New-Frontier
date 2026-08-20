import { Link } from 'react-router-dom'
import { getSectionPath, siteConfig } from '../data/siteConfig'
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
  const sectionPath = getSectionPath(edition, article.section)
  const className = `article-card article-card--${variant}`

  return (
    <article className={className}>
      {article.image && variant !== 'brief' && (
        <Link className="article-card__image-link" to={sectionPath} aria-label={article.title}>
          <img
            className="article-card__image"
            src={article.image}
            alt={article.imageAlt ?? ''}
            width="1200"
            height="675"
            loading={imagePriority ? 'eager' : 'lazy'}
          />
        </Link>
      )}

      <div className="article-card__content">
        <Link className="article-card__section" to={sectionPath}>
          {config.navigation[article.section]}
        </Link>
        <h2 className="article-card__headline">
          <Link to={sectionPath}>{article.title}</Link>
        </h2>
        {article.summary && <p className="article-card__summary">{article.summary}</p>}
        <p className="article-card__meta">
          <span>{edition === 'korean' ? article.author : `By ${article.author}`}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt, edition)}</time>
        </p>
      </div>
    </article>
  )
}
