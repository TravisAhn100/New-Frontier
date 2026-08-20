import type { Article, EditionKey } from '../types/content'
import ArticleCard from './ArticleCard'

interface HomepageGridProps {
  articles: Article[]
  edition: EditionKey
}

export default function HomepageGrid({ articles, edition }: HomepageGridProps) {
  const lead = articles.find((article) => article.featured) ?? articles[0]
  const remaining = articles.filter((article) => article.id !== lead.id)
  const sideStories = remaining.slice(0, 2)
  const standardStories = remaining.slice(2, 5)
  const briefs = remaining.slice(5)

  return (
    <section className="homepage-grid" aria-label={edition === 'korean' ? '주요 기사' : 'Top stories'}>
      <div className="homepage-grid__top">
        <div className="homepage-grid__lead">
          <ArticleCard article={lead} edition={edition} variant="lead" imagePriority />
        </div>
        <div className="homepage-grid__rail">
          {sideStories.map((article) => (
            <ArticleCard key={article.id} article={article} edition={edition} variant="secondary" />
          ))}
        </div>
      </div>

      <div className="homepage-grid__standard">
        {standardStories.map((article) => (
          <ArticleCard key={article.id} article={article} edition={edition} variant="standard" />
        ))}
      </div>

      {briefs.length > 0 && (
        <div className="homepage-grid__briefs">
          {briefs.map((article) => (
            <ArticleCard key={article.id} article={article} edition={edition} variant="brief" />
          ))}
        </div>
      )}
    </section>
  )
}
