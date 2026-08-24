import HomepageGrid from '../components/HomepageGrid'
import { useArticles } from '../context/ArticlesContext'
import { siteConfig } from '../data/siteConfig'
import type { EditionKey } from '../types/content'
import { appearsOnHomepage, compareHomepagePlacement } from '../utils/articlePlacement'

interface HomeProps {
  edition: EditionKey
}

export default function Home({ edition }: HomeProps) {
  const { articles, loading, error } = useArticles()
  const publishedArticles = articles
    .filter((article) => article.edition === edition && article.status === 'published' && appearsOnHomepage(article))
    .sort(compareHomepagePlacement)

  return (
    <>
      <h1 className="visually-hidden">{siteConfig[edition].homepageTitle}</h1>
      {loading && publishedArticles.length === 0 && <p className="content-loading">Loading articles…</p>}
      {error && <p className="content-error">{error}</p>}
      <HomepageGrid articles={publishedArticles} edition={edition} />
    </>
  )
}
