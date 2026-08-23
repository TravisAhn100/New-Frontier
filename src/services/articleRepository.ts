import type { Article } from '../types/content'
import { apiRequest } from './apiClient'

export const articleRepository = {
  getAllArticles() {
    return apiRequest<Article[]>('/api/articles?scope=editorial')
  },

  getArticle(id: string) {
    return apiRequest<Article>(`/api/articles/${encodeURIComponent(id)}`)
  },

  saveArticle(article: Article) {
    return apiRequest<Article>(`/api/articles/${encodeURIComponent(article.id)}`, {
      method: 'PUT',
      body: JSON.stringify(article),
    })
  },

  deleteArticle(id: string) {
    return apiRequest<void>(`/api/articles/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
}
