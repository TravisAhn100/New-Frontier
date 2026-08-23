import { Link, useParams } from 'react-router-dom'
import PublicArticle from '../components/PublicArticle'
import { useArticles } from '../context/ArticlesContext'
import { siteConfig } from '../data/siteConfig'
import type { EditionKey } from '../types/content'

interface ArticlePageProps {
  edition: EditionKey
}

export default function ArticlePage({ edition }: ArticlePageProps) {
  const { slug } = useParams()
  const { articles, loading } = useArticles()
  const article = articles.find((item) => item.edition === edition && item.status === 'published' && item.slug === slug)
  const config = siteConfig[edition]

  if (loading && !article) {
    return <p className="content-loading">Loading article…</p>
  }

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

  return <PublicArticle article={article} edition={edition} />
}
