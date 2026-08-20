import { Link, useParams } from 'react-router-dom'
import { articlesByEdition } from '../data/articles'
import { getSectionPath, siteConfig } from '../data/siteConfig'
import type { EditionKey } from '../types/content'

interface ArticlePageProps {
  edition: EditionKey
}

export default function ArticlePage({ edition }: ArticlePageProps) {
  const { slug } = useParams()
  const article = articlesByEdition[edition].find((item) => item.slug === slug)
  const config = siteConfig[edition]

  if (!article) {
    return (
      <section className="article-not-found" aria-labelledby="article-not-found-title">
        <h1 id="article-not-found-title">
          {edition === 'korean' ? '기사를 찾을 수 없습니다' : 'Article not found'}
        </h1>
        <Link to={config.homePath}>
          {edition === 'korean' ? '한국어 홈페이지로 돌아가기' : 'Return to the homepage'}
        </Link>
      </section>
    )
  }

  const sectionPath = article.section ? getSectionPath(edition, article.section) : undefined

  return (
    <article className="article-page" aria-labelledby="article-title">
      <header className="article-page__header">
        {article.section && sectionPath && (
          <Link className="article-page__section" to={sectionPath}>
            {config.navigation[article.section]}
          </Link>
        )}
        <h1 id="article-title">{article.title}</h1>
        <p className="article-page__meta">
          <span>{edition === 'korean' ? article.author : `By ${article.author}`}</span>
          {article.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={article.publishedAt}>{article.publishedAt}</time>
            </>
          )}
        </p>
      </header>

      {article.image && (
        <img
          className="article-page__image"
          src={article.image}
          alt={article.imageAlt ?? ''}
        />
      )}

      <div className="article-page__body">
        {article.body?.map((paragraph, index) => (
          <p key={`${article.id}-paragraph-${index}`}>{paragraph}</p>
        ))}
      </div>
    </article>
  )
}
