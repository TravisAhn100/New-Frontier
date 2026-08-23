import { Link } from 'react-router-dom'
import { useArticles } from '../context/ArticlesContext'
import { siteConfig } from '../data/siteConfig'
import type { Article, ArticleStatus } from '../types/content'

function displayDate(article: Article) {
  const value = article.publishedAt ?? article.updatedAt
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

function ArticleGroup({ label, status, articles }: { label: string; status: ArticleStatus; articles: Article[] }) {
  const filtered = articles.filter((article) => article.status === status)

  return (
    <section className="editorial-list-group">
      <h2>{label} <span>{filtered.length}</span></h2>
      {filtered.length === 0 ? <p className="editorial-empty">No articles in this group.</p> : (
        <div className="editorial-article-list">
          {filtered.map((article) => (
            <article key={article.id}>
              <div>
                <p>{article.edition} · {article.section ? siteConfig[article.edition].navigation[article.section] : 'Unsectioned'} · {displayDate(article)}</p>
                <h3>{article.title || 'Untitled draft'}</h3>
                <span>{article.authors[0]?.name || 'Unassigned writer'}</span>
              </div>
              <Link to={`/edit/article/${article.id}`}>Edit</Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export default function EditorialArticlesPage() {
  const { articles } = useArticles()

  return (
    <section className="editorial-list-page" aria-labelledby="editorial-articles-title">
      <header className="editorial-page-heading">
        <div><p>Editorial</p><h1 id="editorial-articles-title">Edit articles</h1></div>
        <Link to="/edit/new">＋ New article</Link>
      </header>
      <ArticleGroup label="Drafts" status="draft" articles={articles} />
      <ArticleGroup label="Published" status="published" articles={articles} />
    </section>
  )
}
