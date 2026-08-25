import { ChangeEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useArticles } from '../context/ArticlesContext'
import { siteConfig } from '../data/siteConfig'
import {
  articleService,
  createArticleBlock,
  isSafeArticleLink,
  normalizeTopic,
  slugify,
} from '../services/articleService'
import { imageService } from '../services/imageService'
import type { Article, ArticleBlock, ArticleBlockType, ArticlePlacement, ArticleSection, EditionKey } from '../types/content'
import { articlePlacementOptions } from '../utils/articlePlacement'

const blockTools: Array<{ type: ArticleBlockType; symbol: string; label: string }> = [
  { type: 'paragraph', symbol: 'T', label: 'Text' },
  { type: 'heading', symbol: 'H', label: 'Heading' },
  { type: 'quote', symbol: '❝', label: 'Quote' },
  { type: 'image', symbol: '▧', label: 'Image' },
  { type: 'link', symbol: '↗', label: 'Link' },
]

const sections: ArticleSection[] = ['news', 'culture', 'opinion', 'school']
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

function blockLabel(type: ArticleBlockType) {
  return blockTools.find((tool) => tool.type === type)?.label ?? type
}

export default function ArticleEditorPage() {
  const { id } = useParams()
  const { articles, refresh } = useArticles()
  const navigate = useNavigate()
  const [article, setArticle] = useState<Article>()
  const [topicInput, setTopicInput] = useState('')
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const [busyAction, setBusyAction] = useState<'save' | 'preview' | 'publish' | 'image' | 'delete'>()
  const [toolbarOpen, setToolbarOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    let active = true
    if (id) {
      const existing = articles.find((item) => item.id === id)
      if (existing) setArticle(existing)
      else {
        void articleService.getArticle(id)
          .then((loaded) => {
            if (active) setArticle(loaded)
          })
          .catch((nextError) => {
            if (active) setError(nextError instanceof Error ? nextError.message : 'Unable to load the article.')
          })
      }
      return () => {
        active = false
      }
    }

    setArticle(articleService.createArticle())
    return () => {
      active = false
    }
  }, [id, articles])

  function updateArticle(patch: Partial<Article>) {
    setArticle((current) => current ? { ...current, ...patch } : current)
    setFeedback('')
  }

  function updateBlock(blockId: string, patch: Partial<ArticleBlock>) {
    setArticle((current) => current ? {
      ...current,
      body: current.body.map((block) => block.id === blockId ? { ...block, ...patch } as ArticleBlock : block),
    } : current)
    setFeedback('')
  }

  function addBlock(type: ArticleBlockType) {
    setArticle((current) => current ? { ...current, body: [...current.body, createArticleBlock(type)] } : current)
    setToolbarOpen(false)
  }

  function moveBlock(blockId: string, direction: -1 | 1) {
    setArticle((current) => {
      if (!current) return current
      const index = current.body.findIndex((block) => block.id === blockId)
      const target = index + direction
      if (index < 0 || target < 0 || target >= current.body.length) return current
      const body = [...current.body]
      ;[body[index], body[target]] = [body[target], body[index]]
      return { ...current, body }
    })
  }

  function removeBlock(blockId: string) {
    setArticle((current) => current ? { ...current, body: current.body.filter((block) => block.id !== blockId) } : current)
  }

  function addTopic() {
    if (!article) return
    const topic = normalizeTopic(topicInput)
    if (!topic || article.topicSlugs.includes(topic.slug)) return
    updateArticle({ topics: [...article.topics, topic], topicSlugs: [...article.topicSlugs, topic.slug] })
    setTopicInput('')
  }

  function removeTopic(slug: string) {
    if (!article) return
    updateArticle({
      topics: article.topics.filter((topic) => topic.slug !== slug),
      topicSlugs: article.topicSlugs.filter((topicSlug) => topicSlug !== slug),
    })
  }

  async function storeImage(file: File) {
    if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
    if (file.size > MAX_IMAGE_BYTES) throw new Error('Images must be smaller than 10 MB.')
    return imageService.store(file)
  }

  async function handleCoverImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusyAction('image')
    setError('')
    try {
      updateArticle({ coverImage: await storeImage(file), coverImageAlt: article?.coverImageAlt || file.name })
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to save the image.')
    } finally {
      setBusyAction(undefined)
    }
  }

  async function handleInlineImage(blockId: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setBusyAction('image')
    setError('')
    try {
      updateBlock(blockId, { imageRef: await storeImage(file), alt: file.name })
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to save the image.')
    } finally {
      setBusyAction(undefined)
    }
  }

  async function saveDraft() {
    if (!article) return undefined
    setBusyAction('save')
    setError('')
    try {
      const saved = await articleService.saveDraft(article)
      setArticle(saved)
      await refresh()
      setFeedback('Saved')
      if (!id) navigate(`/edit/article/${saved.id}`, { replace: true })
      return saved
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to save the draft.')
      return undefined
    } finally {
      setBusyAction(undefined)
    }
  }

  async function previewArticle() {
    if (!article) return
    setBusyAction('preview')
    setError('')
    try {
      const saved = await articleService.saveDraft(article)
      setArticle(saved)
      await refresh()
      navigate(`/edit/preview/${saved.id}`)
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to open the preview.')
    } finally {
      setBusyAction(undefined)
    }
  }

  async function publishArticle() {
    if (!article) return
    setBusyAction('publish')
    setError('')
    try {
      const published = await articleService.publishArticle(article)
      setArticle(published)
      await refresh()
      setFeedback('Published')
      if (!id) navigate(`/edit/article/${published.id}`, { replace: true })
    } catch (nextError) {
      const message = nextError instanceof Error ? nextError.message : 'Unable to publish the article.'
      setError(`Publishing failed: ${message}`)
    } finally {
      setBusyAction(undefined)
    }
  }

  async function confirmDelete() {
    if (!article) return
    setBusyAction('delete')
    setError('')
    try {
      await articleService.deleteArticle(article.id)
      await refresh()
      navigate('/edit/articles', { replace: true })
    } catch (nextError) {
      setDeleteOpen(false)
      setError(nextError instanceof Error ? nextError.message : 'Unable to delete the article. Try again.')
    } finally {
      setBusyAction(undefined)
    }
  }

  if (!article) {
    return (
      <p className={`editorial-loading${error ? ' is-error' : ''}`} role={error ? 'alert' : 'status'}>
        {error || 'Loading article…'}
      </p>
    )
  }

  const config = siteConfig[article.edition]
  const primaryAuthor = article.authors[0] ?? { id: '', name: '' }

  return (
    <section className={`article-editor article-editor--${article.edition}`} aria-labelledby="editor-title">
      <header className="article-editor__actions">
        <div>
          <p>{id ? 'Edit article' : 'New article'}</p>
          <h1 id="editor-title">{article.title || 'Untitled draft'}</h1>
        </div>
        <div className="article-editor__action-buttons">
          <button type="button" onClick={() => void saveDraft()} disabled={Boolean(busyAction)}>✓ <span>{busyAction === 'save' ? 'Saving…' : article.status === 'published' ? 'Save changes' : 'Save draft'}</span></button>
          <button type="button" onClick={() => void previewArticle()} disabled={Boolean(busyAction)}>▣ <span>{busyAction === 'preview' ? 'Preparing…' : 'Preview'}</span></button>
          <button className="is-primary" type="button" onClick={() => void publishArticle()} disabled={Boolean(busyAction)}>↑ <span>{busyAction === 'publish' ? 'Publishing…' : 'Publish'}</span></button>
          <button className="editor-toolbar-toggle" type="button" aria-expanded={toolbarOpen} onClick={() => setToolbarOpen((open) => !open)}>＋ <span>Tools</span></button>
        </div>
      </header>

      {(feedback || error) && (
        <div className={`article-editor__feedback${error ? ' is-error' : ''}`} role={error ? 'alert' : 'status'}>
          {error || feedback}
          {feedback === 'Published' && (
            <Link to={`/${article.edition === 'korean' ? 'ko/' : ''}article/${article.slug}`}>View article</Link>
          )}
        </div>
      )}

      <div className="article-editor__workspace">
        <div className="article-editor__canvas">
          <p className="article-editor__section-preview">
            {article.section ? config.navigation[article.section] : 'Section'}
          </p>
          <textarea
            className="article-editor__title-input"
            value={article.title}
            rows={2}
            aria-label="Article headline"
            placeholder="Headline goes here"
            onChange={(event) => updateArticle({ title: event.target.value, slug: slugify(event.target.value) })}
          />
          <textarea
            className="article-editor__deck-input"
            value={article.subtitle}
            rows={2}
            aria-label="Subtitle or deck"
            placeholder="Deck or subheadline goes here…"
            onChange={(event) => updateArticle({ subtitle: event.target.value })}
          />

          <div className="article-editor__blocks">
            {article.body.map((block, index) => (
              <section className={`editor-block editor-block--${block.type}`} key={block.id} aria-label={`${blockLabel(block.type)} block`}>
                <header>
                  <span>{blockLabel(block.type)}</span>
                  <div>
                    <button type="button" aria-label="Move block up" disabled={index === 0} onClick={() => moveBlock(block.id, -1)}>↑</button>
                    <button type="button" aria-label="Move block down" disabled={index === article.body.length - 1} onClick={() => moveBlock(block.id, 1)}>↓</button>
                    <button type="button" aria-label="Delete block" onClick={() => removeBlock(block.id)}>⌫</button>
                  </div>
                </header>
                {(block.type === 'paragraph' || block.type === 'heading' || block.type === 'quote') && (
                  <textarea
                    value={block.content}
                    rows={block.type === 'paragraph' ? 5 : 2}
                    aria-label={`${blockLabel(block.type)} content`}
                    placeholder={block.type === 'paragraph' ? 'Write the article…' : `${blockLabel(block.type)} text`}
                    onChange={(event) => updateBlock(block.id, { content: event.target.value })}
                  />
                )}
                {block.type === 'link' && (
                  <div className="editor-block__fields">
                    <label>Link text<input value={block.content} onChange={(event) => updateBlock(block.id, { content: event.target.value })} /></label>
                    <label>URL<input type="url" value={block.url} placeholder="https://… or /article/…" onChange={(event) => updateBlock(block.id, { url: event.target.value })} /></label>
                    {block.url && !isSafeArticleLink(block.url) && <p className="field-error">Use an internal path or a complete http/https URL.</p>}
                  </div>
                )}
                {block.type === 'image' && (
                  <div className="editor-block__fields">
                    <label>Upload image<input type="file" accept="image/*" disabled={busyAction === 'image'} onChange={(event) => void handleInlineImage(block.id, event)} /></label>
                    {block.imageRef && <span className="image-stored-status">Image stored</span>}
                    <label>Caption<input value={block.caption} onChange={(event) => updateBlock(block.id, { caption: event.target.value })} /></label>
                    <label>Credit<input value={block.credit} onChange={(event) => updateBlock(block.id, { credit: event.target.value })} /></label>
                    <label>Alt text<input value={block.alt} onChange={(event) => updateBlock(block.id, { alt: event.target.value })} /></label>
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>

        <aside className={`article-editor__toolbar${toolbarOpen ? ' is-open' : ''}`} aria-label="Article tools">
          <section>
            <h2>Article</h2>
            <fieldset>
              <legend>Edition</legend>
              {(['international', 'korean'] as EditionKey[]).map((edition) => (
                <label className="radio-row" key={edition}>
                  <input type="radio" name="edition" checked={article.edition === edition} onChange={() => updateArticle({ edition })} />
                  {edition === 'international' ? 'International' : 'Korean'}
                </label>
              ))}
            </fieldset>
            <label>Section
              <select value={article.section ?? ''} onChange={(event) => updateArticle({ section: event.target.value as ArticleSection })}>
                {sections.map((section) => <option key={section} value={section}>{siteConfig.international.navigation[section]}</option>)}
              </select>
            </label>
            <label>Author
              <input value={primaryAuthor.name} onChange={(event) => updateArticle({ authors: [{ id: slugify(event.target.value), name: event.target.value }], primaryAuthorId: slugify(event.target.value) })} />
            </label>
            <label>Publication date
              <input type="date" value={article.publishedAt?.slice(0, 10) ?? ''} onChange={(event) => updateArticle({ publishedAt: event.target.value || undefined })} />
            </label>
            <label>Slug
              <input value={article.slug} onChange={(event) => updateArticle({ slug: slugify(event.target.value) })} />
            </label>
            <label>Placement
              <select value={article.placement} onChange={(event) => updateArticle({ placement: event.target.value as ArticlePlacement })}>
                {articlePlacementOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          </section>

          <section>
            <h2>Topics</h2>
            <div className="topic-list">
              {article.topics.map((topic) => (
                <button type="button" key={topic.slug} onClick={() => removeTopic(topic.slug)}>{topic.label} <span aria-hidden="true">×</span></button>
              ))}
            </div>
            <div className="topic-entry">
              <input aria-label="New topic" value={topicInput} placeholder="Add topic" onChange={(event) => setTopicInput(event.target.value)} onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addTopic()
                }
              }} />
              <button type="button" onClick={addTopic}>＋</button>
            </div>
          </section>

          <section>
            <h2>Cover image</h2>
            <label>Upload image<input type="file" accept="image/*" disabled={busyAction === 'image'} onChange={(event) => void handleCoverImage(event)} /></label>
            {busyAction === 'image' && <span className="image-stored-status">Uploading image…</span>}
            {article.coverImage && busyAction !== 'image' && <span className="image-stored-status">Cover image ready</span>}
            <label>Caption<input value={article.coverImageCaption} onChange={(event) => updateArticle({ coverImageCaption: event.target.value })} /></label>
            <label>Credit<input value={article.coverImageCredit} onChange={(event) => updateArticle({ coverImageCredit: event.target.value })} /></label>
            <label>Alt text<input value={article.coverImageAlt} onChange={(event) => updateArticle({ coverImageAlt: event.target.value })} /></label>
          </section>

          <section>
            <h2>Add block</h2>
            <div className="block-tool-list">
              {blockTools.map((tool) => (
                <button type="button" key={tool.type} title={`Add ${tool.label.toLowerCase()} block`} onClick={() => addBlock(tool.type)}>
                  <span aria-hidden="true">{tool.symbol}</span>{tool.label}
                </button>
              ))}
            </div>
          </section>

          {id && (
            <button className="article-editor__delete" type="button" onClick={() => setDeleteOpen(true)}>⌫ Delete article</button>
          )}
        </aside>
      </div>

      {deleteOpen && (
        <div className="delete-dialog-backdrop" role="presentation">
          <section className="delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
            <h2 id="delete-dialog-title">Delete this article?</h2>
            <p>This action cannot be undone.</p>
            <div>
              <button type="button" disabled={busyAction === 'delete'} onClick={() => setDeleteOpen(false)}>Cancel</button>
              <button className="is-danger" type="button" disabled={busyAction === 'delete'} onClick={() => void confirmDelete()}>{busyAction === 'delete' ? 'Deleting…' : 'Delete'}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}
