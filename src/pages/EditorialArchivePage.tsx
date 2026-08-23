import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useArticles } from '../context/ArticlesContext'
import { siteConfig } from '../data/siteConfig'

export default function EditorialArchivePage() {
  const { articles } = useArticles()
  const [date, setDate] = useState('')
  const [topic, setTopic] = useState('')
  const [writer, setWriter] = useState('')
  const topics = useMemo(() => {
    const unique = new Map<string, string>()
    articles.forEach((article) => article.topics.forEach((item) => unique.set(item.slug, item.label)))
    return [...unique.entries()].sort((left, right) => left[1].localeCompare(right[1]))
  }, [articles])
  const filtered = articles.filter((article) => (
    (!date || article.publishedAt?.slice(0, 10) === date)
    && (!topic || article.topicSlugs.includes(topic))
    && (!writer || article.authors.some((author) => author.name.toLowerCase().includes(writer.toLowerCase())))
  ))

  return (
    <section className="editorial-list-page" aria-labelledby="editorial-archive-title">
      <header className="editorial-page-heading"><div><p>Editorial</p><h1 id="editorial-archive-title">Archive</h1></div></header>
      <div className="archive-filters" aria-label="Archive filters">
        <label>Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
        <label>Topic<select value={topic} onChange={(event) => setTopic(event.target.value)}><option value="">All topics</option>{topics.map(([slug, label]) => <option key={slug} value={slug}>{label}</option>)}</select></label>
        <label>Writer<input value={writer} placeholder="Writer name" onChange={(event) => setWriter(event.target.value)} /></label>
        <button type="button" onClick={() => { setDate(''); setTopic(''); setWriter('') }}>Clear</button>
      </div>
      <div className="editorial-article-list">
        {filtered.map((article) => (
          <article key={article.id}>
            <div>
              <p>{article.status} · {article.edition} · {article.section ? siteConfig[article.edition].navigation[article.section] : 'Unsectioned'}</p>
              <h2>{article.title || 'Untitled draft'}</h2>
              <span>{article.authors.map((author) => author.name).filter(Boolean).join(', ') || 'Unassigned writer'} · {(article.publishedAt ?? article.updatedAt).slice(0, 10)}</span>
            </div>
            <Link to={`/edit/article/${article.id}`}>Edit</Link>
          </article>
        ))}
        {filtered.length === 0 && <p className="editorial-empty">No articles match these filters.</p>}
      </div>
    </section>
  )
}
