import { Link } from 'react-router-dom'
import { getSectionPath, siteConfig } from '../data/siteConfig'
import { isSafeArticleLink } from '../services/articleService'
import type { Article, EditionKey } from '../types/content'
import ResolvedImage from './ResolvedImage'

interface PublicArticleProps {
  article: Article
  edition: EditionKey
  preview?: boolean
}

function formatArticleDate(date: string, edition: EditionKey) {
  return new Intl.DateTimeFormat(siteConfig[edition].dateLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date.length === 10 ? `${date}T12:00:00+09:00` : date))
}

export default function PublicArticle({ article, edition, preview = false }: PublicArticleProps) {
  const config = siteConfig[edition]
  const sectionPath = article.section ? getSectionPath(edition, article.section) : undefined
  const primaryAuthor = article.authors.find((author) => author.id === article.primaryAuthorId) ?? article.authors[0]
  const showSubtitle = edition === 'international' || preview

  return (
    <article className={`article-page article-page--${edition}${preview ? ' article-page--preview' : ''}`} aria-labelledby="article-title">
      <header className="article-page__header">
        {preview && <p className="article-page__preview-label">Unpublished preview</p>}
        {article.section && sectionPath && (
          <Link className="article-page__section" to={sectionPath}>
            {config.navigation[article.section]}
          </Link>
        )}
        <h1 id="article-title">{article.title || 'Untitled article'}</h1>
        {showSubtitle && article.subtitle && <p className="article-page__deck">{article.subtitle}</p>}
        <p className="article-page__meta">
          <span>{edition === 'korean' ? primaryAuthor?.name : `By ${primaryAuthor?.name || 'Unassigned'}`}</span>
          {article.publishedAt && (
            <>
              <span aria-hidden="true">·</span>
              <time dateTime={article.publishedAt}>
                {edition === 'korean' ? article.publishedAt.slice(0, 10) : formatArticleDate(article.publishedAt, edition)}
              </time>
            </>
          )}
        </p>
      </header>

      {article.coverImage && (
        <figure className="article-page__cover">
          <ResolvedImage
            className="article-page__image"
            reference={article.coverImage}
            alt={article.coverImageAlt}
          />
          {(article.coverImageCaption || article.coverImageCredit) && (
            <figcaption>
              {article.coverImageCaption}
              {article.coverImageCredit && <span>{article.coverImageCredit}</span>}
            </figcaption>
          )}
        </figure>
      )}

      <div className="article-page__body">
        {article.body.map((block) => {
          if (block.type === 'heading') return <h2 key={block.id}>{block.content}</h2>
          if (block.type === 'quote') return <blockquote key={block.id}>{block.content}</blockquote>
          if (block.type === 'image') {
            if (!block.imageRef) return null
            return (
              <figure className="article-page__inline-image" key={block.id}>
                <ResolvedImage reference={block.imageRef} alt={block.alt} />
                {(block.caption || block.credit) && (
                  <figcaption>
                    {block.caption}
                    {block.credit && <span>{block.credit}</span>}
                  </figcaption>
                )}
              </figure>
            )
          }
          if (block.type === 'link') {
            const external = /^https?:\/\//i.test(block.url)
            return (
              <p className="article-page__link-block" key={block.id}>
                {isSafeArticleLink(block.url) ? (
                  <a href={block.url} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
                    {block.content}
                  </a>
                ) : block.content}
              </p>
            )
          }
          return <p key={block.id}>{block.content}</p>
        })}
      </div>
    </article>
  )
}
