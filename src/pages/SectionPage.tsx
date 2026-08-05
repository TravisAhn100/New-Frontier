interface SectionPageProps {
  section: string
}

export default function SectionPage({ section }: SectionPageProps) {
  return (
    <section className="section-page">
      <div className="section-page__rule" />
      <h1 className="section-page__title">{section}</h1>
      <div className="section-page__placeholder">
        <p>
          <strong>{section}</strong> articles will appear here.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          This is a placeholder page for the prototype.
        </p>
      </div>
    </section>
  )
}
