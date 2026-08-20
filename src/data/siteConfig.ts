import type { EditionKey, SectionKey } from '../types/content'

export const sectionOrder: SectionKey[] = [
  'news',
  'culture',
  'opinion',
  'school',
  'info',
]

interface EditionConfig {
  key: EditionKey
  language: string
  publicationName: string
  editionLabel: string
  homePath: string
  masthead: string
  mastheadAlt: string
  dateLocale: string
  dateTimeZone: string
  navigation: Record<SectionKey, string>
  homepageTitle: string
}

export const siteConfig: Record<EditionKey, EditionConfig> = {
  international: {
    key: 'international',
    language: 'en',
    publicationName: 'New Frontier',
    editionLabel: 'International',
    homePath: '/',
    masthead: '/assets/NF_header_International.svg',
    mastheadAlt: 'New Frontier — The Owl of Minerva Flies at Dusk',
    dateLocale: 'en-US',
    dateTimeZone: 'Asia/Seoul',
    navigation: {
      news: 'News',
      culture: 'Culture',
      opinion: 'Opinion',
      school: 'School',
      info: 'Info',
    },
    homepageTitle: 'New Frontier International edition',
  },
  korean: {
    key: 'korean',
    language: 'ko',
    publicationName: 'New Frontier',
    editionLabel: 'Korean',
    homePath: '/ko',
    masthead: '/assets/NF_header_Korean_cropped.svg',
    mastheadAlt: '뉴 프론티어 — 미네르바의 부엉이는 황혼에 날개를 편다',
    dateLocale: 'ko-KR',
    dateTimeZone: 'Asia/Seoul',
    navigation: {
      news: '뉴스',
      culture: '문화',
      opinion: '칼럼',
      school: '학교',
      info: '정보',
    },
    homepageTitle: '뉴 프론티어 한국어판',
  },
}

export function getSectionPath(edition: EditionKey, section: SectionKey) {
  const prefix = edition === 'korean' ? '/ko' : ''
  return `${prefix}/${section}`
}

export function getArticlePath(edition: EditionKey, slug: string) {
  const prefix = edition === 'korean' ? '/ko' : ''
  return `${prefix}/article/${slug}`
}

export function formatPublicationDate(edition: EditionKey, date = new Date()) {
  const config = siteConfig[edition]

  return new Intl.DateTimeFormat(config.dateLocale, {
    timeZone: config.dateTimeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
