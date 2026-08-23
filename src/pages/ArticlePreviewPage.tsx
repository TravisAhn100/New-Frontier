import { Link, useParams } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import PublicArticle from '../components/PublicArticle'
import { useArticles } from '../context/ArticlesContext'

export default function ArticlePreviewPage() {
  const { id } = useParams()
  const { articles, loading } = useArticles()
  const article = articles.find((item) => item.id === id)

  if (loading && !article) return <p className="editorial-loading">Loading preview…</p>
  if (!article) return <main className="editorial-loading"><h1>Preview unavailable</h1><Link to="/edit/articles">Return to articles</Link></main>

  return (
    <div className="article-preview-shell">
      <nav className="article-preview-bar" aria-label="Preview controls">
        <span>Unpublished preview</span>
        <Link to={`/edit/article/${article.id}`}>Return to editor</Link>
      </nav>
      <div className={`site-shell site-shell--${article.edition}`}>
        <Header edition={article.edition} />
        <main className="site-main"><div className="page-width"><PublicArticle article={article} edition={article.edition} preview /></div></main>
        <Footer edition={article.edition} />
      </div>
    </div>
  )
}
