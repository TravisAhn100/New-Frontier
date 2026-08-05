interface ArticleCardProps {
  section: string
  headline: string
  deck?: string
  byline: string
  className?: string
}

export default function ArticleCard({
  section,
  headline,
  deck,
  byline,
  className = '',
}: ArticleCardProps) {
  return (
    <article className={`article-card ${className}`}>
      <div className="article-card__img" aria-hidden="true">
        <span className="article-card__img-placeholder">Photo placeholder</span>
      </div>
      <div className="article-card__body">
        <span className="article-card__section">{section}</span>
        <h2 className="article-card__headline">{headline}</h2>
        {deck && <p className="article-card__deck">{deck}</p>}
        <p className="article-card__byline">By {byline}</p>
      </div>
    </article>
  )
}
