import { Link } from 'react-router-dom'

const editorialAreas = [
  { label: 'Write', description: 'Start a new article.', path: '/edit/new' },
  { label: 'Edit', description: 'Continue drafts and revise published work.', path: '/edit/articles' },
  { label: 'Archive', description: 'Browse the publication by date, topic, and writer.', path: '/edit/archive' },
]

export default function EditorialHome() {
  return (
    <section className="editorial-home" aria-labelledby="editorial-home-title">
      <header>
        <p>Publication workspace</p>
        <h1 id="editorial-home-title">Editorial desk</h1>
      </header>
      <div className="editorial-home__grid">
        {editorialAreas.map((area, index) => (
          <Link key={area.label} to={area.path}>
            <span aria-hidden="true">0{index + 1}</span>
            <h2>{area.label}</h2>
            <p>{area.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
