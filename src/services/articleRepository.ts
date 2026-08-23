import { internationalArticles, koreanArticles } from '../data/articles'
import type { Article, StoredImageAsset } from '../types/content'

const DATABASE_NAME = 'new-frontier-editorial'
const DATABASE_VERSION = 1
const ARTICLE_STORE = 'articles'
const IMAGE_STORE = 'images'

let databasePromise: Promise<IDBDatabase> | undefined
let initializationPromise: Promise<void> | undefined

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed.'))
  })
}

function transactionComplete(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error ?? new Error('IndexedDB transaction failed.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('IndexedDB transaction was aborted.'))
  })
}

function openDatabase() {
  if (!databasePromise) {
    databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)

      request.onupgradeneeded = () => {
        const database = request.result

        if (!database.objectStoreNames.contains(ARTICLE_STORE)) {
          const articleStore = database.createObjectStore(ARTICLE_STORE, { keyPath: 'id' })
          articleStore.createIndex('edition_slug', ['edition', 'slug'], { unique: true })
          articleStore.createIndex('status', 'status')
          articleStore.createIndex('published_at', 'publishedAt')
          articleStore.createIndex('primary_author', 'primaryAuthorId')
          articleStore.createIndex('topics', 'topicSlugs', { multiEntry: true })
        }

        if (!database.objectStoreNames.contains(IMAGE_STORE)) {
          database.createObjectStore(IMAGE_STORE, { keyPath: 'id' })
        }
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error ?? new Error('Unable to open editorial storage.'))
    })
  }

  return databasePromise
}

async function initialize() {
  if (!initializationPromise) {
    initializationPromise = (async () => {
      const database = await openDatabase()
      const countTransaction = database.transaction(ARTICLE_STORE, 'readonly')
      const count = await requestResult(countTransaction.objectStore(ARTICLE_STORE).count())
      await transactionComplete(countTransaction)

      if (count === 0) {
        const seedTransaction = database.transaction(ARTICLE_STORE, 'readwrite')
        const store = seedTransaction.objectStore(ARTICLE_STORE)
        ;[...internationalArticles, ...koreanArticles].forEach((article) => store.put(article))
        await transactionComplete(seedTransaction)
      }
    })()
  }

  return initializationPromise
}

export const articleRepository = {
  async getAllArticles() {
    await initialize()
    const database = await openDatabase()
    const transaction = database.transaction(ARTICLE_STORE, 'readonly')
    const articles = await requestResult(transaction.objectStore(ARTICLE_STORE).getAll()) as Article[]
    await transactionComplete(transaction)
    return articles
  },

  async getArticle(id: string) {
    await initialize()
    const database = await openDatabase()
    const transaction = database.transaction(ARTICLE_STORE, 'readonly')
    const article = await requestResult(transaction.objectStore(ARTICLE_STORE).get(id)) as Article | undefined
    await transactionComplete(transaction)
    return article
  },

  async saveArticle(article: Article) {
    await initialize()
    const database = await openDatabase()
    const transaction = database.transaction(ARTICLE_STORE, 'readwrite')
    transaction.objectStore(ARTICLE_STORE).put(article)
    await transactionComplete(transaction)
    return article
  },

  async deleteArticle(id: string) {
    await initialize()
    const database = await openDatabase()
    const transaction = database.transaction(ARTICLE_STORE, 'readwrite')
    transaction.objectStore(ARTICLE_STORE).delete(id)
    await transactionComplete(transaction)
  },

  async saveImage(asset: StoredImageAsset) {
    await initialize()
    const database = await openDatabase()
    const transaction = database.transaction(IMAGE_STORE, 'readwrite')
    transaction.objectStore(IMAGE_STORE).put(asset)
    await transactionComplete(transaction)
    return asset
  },

  async getImage(id: string) {
    await initialize()
    const database = await openDatabase()
    const transaction = database.transaction(IMAGE_STORE, 'readonly')
    const asset = await requestResult(transaction.objectStore(IMAGE_STORE).get(id)) as StoredImageAsset | undefined
    await transactionComplete(transaction)
    return asset
  },

  async deleteImage(id: string) {
    await initialize()
    const database = await openDatabase()
    const transaction = database.transaction(IMAGE_STORE, 'readwrite')
    transaction.objectStore(IMAGE_STORE).delete(id)
    await transactionComplete(transaction)
  },
}
