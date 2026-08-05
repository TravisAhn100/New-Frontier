import ArticleCard from '../components/ArticleCard'

const PLACEHOLDER_ARTICLES = [
  {
    id: 1,
    section: 'News',
    headline: 'Student Council Proposes New Academic Calendar Reform Ahead of Next Term',
    deck: 'A draft proposal circulated among faculty would shift the semester schedule to better align with international exchange programs.',
    byline: 'Staff Reporter',
    slot: 'hero' as const,
  },
  {
    id: 2,
    section: 'Culture',
    headline: 'School Choir Prepares for Regional Competition',
    deck: 'The ensemble rehearses three evenings a week as the regional finals approach.',
    byline: 'Arts Desk',
    slot: 'tr' as const,
  },
  {
    id: 3,
    section: 'Opinion',
    headline: 'Why Mandatory Study Halls Deserve a Second Look',
    deck: 'A student columnist argues the policy has unintended benefits worth preserving.',
    byline: 'Editorial Board',
    slot: 'br' as const,
  },
  {
    id: 4,
    section: 'School',
    headline: 'Library Renovation Set to Begin After Finals Week',
    byline: 'Campus Desk',
    slot: 'bottom' as const,
  },
  {
    id: 5,
    section: 'Info',
    headline: 'Upcoming Dates: Exams, Holidays, and Registration Deadlines',
    byline: 'Info Desk',
    slot: 'bottom' as const,
  },
]

export default function Home() {
  const hero   = PLACEHOLDER_ARTICLES.find(a => a.slot === 'hero')!
  const tr     = PLACEHOLDER_ARTICLES.find(a => a.slot === 'tr')!
  const br     = PLACEHOLDER_ARTICLES.find(a => a.slot === 'br')!
  const bottom = PLACEHOLDER_ARTICLES.filter(a => a.slot === 'bottom')

  return (
    <section className="home-grid" aria-label="Homepage articles">
      <div className="home-grid__inner">
        <ArticleCard {...hero} className="article-card--hero" />
        <ArticleCard {...tr}   className="article-card--tr" />
        <ArticleCard {...br}   className="article-card--br" />
        <div className="home-grid__bottom">
          {bottom.map(article => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </div>
    </section>
  )
}
