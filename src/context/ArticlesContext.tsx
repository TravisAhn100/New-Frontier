import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { articleService } from '../services/articleService'
import { authService } from '../services/authService'
import type { Article } from '../types/content'

interface ArticlesContextValue {
  articles: Article[]
  loading: boolean
  error?: string
  refresh: () => Promise<void>
}

const ArticlesContext = createContext<ArticlesContextValue | undefined>(undefined)

export function ArticlesProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const refresh = useCallback(async () => {
    try {
      setError(undefined)
      setArticles(await articleService.getArticles())
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Unable to load articles.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    window.addEventListener(authService.eventName, refresh)
    return () => window.removeEventListener(authService.eventName, refresh)
  }, [refresh])

  const value = useMemo(() => ({ articles, loading, error, refresh }), [articles, loading, error, refresh])

  return <ArticlesContext.Provider value={value}>{children}</ArticlesContext.Provider>
}

export function useArticles() {
  const context = useContext(ArticlesContext)
  if (!context) throw new Error('useArticles must be used within ArticlesProvider.')
  return context
}
