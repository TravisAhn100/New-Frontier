import HomepageGrid from '../components/HomepageGrid'
import { articlesByEdition } from '../data/articles'
import { siteConfig } from '../data/siteConfig'
import type { EditionKey } from '../types/content'

interface HomeProps {
  edition: EditionKey
}

export default function Home({ edition }: HomeProps) {
  return (
    <>
      <h1 className="visually-hidden">{siteConfig[edition].homepageTitle}</h1>
      <HomepageGrid articles={articlesByEdition[edition]} edition={edition} />
    </>
  )
}
