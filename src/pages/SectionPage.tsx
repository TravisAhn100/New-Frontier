import ArticleCard from '../components/ArticleCard'
import { articlesByEdition } from '../data/articles'
import { siteConfig } from '../data/siteConfig'
import type { EditionKey, SectionKey } from '../types/content'

interface SectionPageProps {
  edition: EditionKey
  section: SectionKey
}

export default function SectionPage({ edition, section }: SectionPageProps) {
  const label = siteConfig[edition].navigation[section]

  if (section === 'info') {
    return (
      <section className="info-page" aria-labelledby="info-title">
        <h1 className="visually-hidden" id="info-title">{label}</h1>
      </section>
    )
  }

  const articles = articlesByEdition[edition].filter((article) => article.section === section)

  return (
    <section className="section-page" aria-labelledby="section-title">
      <header className="section-page__header">
        <p>{edition === 'korean' ? '섹션' : 'Section'}</p>
        <h1 id="section-title">{label}</h1>
      </header>
      <div className="section-page__grid">
        {articles.map((article, index) => (
          <ArticleCard
            key={article.id}
            article={article}
            edition={edition}
            variant="standard"
            imagePriority={index === 0}
          />
        ))}
      </div>
    </section>
  )
}
