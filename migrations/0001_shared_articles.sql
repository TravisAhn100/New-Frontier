CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  edition TEXT NOT NULL CHECK (edition IN ('international', 'korean')),
  section TEXT CHECK (section IN ('news', 'culture', 'opinion', 'school')),
  topics_json TEXT NOT NULL DEFAULT '[]',
  topic_slugs_json TEXT NOT NULL DEFAULT '[]',
  authors_json TEXT NOT NULL DEFAULT '[]',
  primary_author_id TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  cover_image_caption TEXT NOT NULL DEFAULT '',
  cover_image_credit TEXT NOT NULL DEFAULT '',
  cover_image_alt TEXT NOT NULL DEFAULT '',
  cover_image_position TEXT CHECK (cover_image_position IN ('center', 'top')),
  body_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  published_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  layout TEXT NOT NULL DEFAULT 'standard' CHECK (layout IN ('lead', 'secondary', 'standard', 'brief')),
  UNIQUE (edition, slug)
);

CREATE TABLE IF NOT EXISTS app_metadata (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_primary_author ON articles(primary_author_id);
CREATE INDEX IF NOT EXISTS idx_articles_section ON articles(section);
CREATE INDEX IF NOT EXISTS idx_articles_edition_status_published
  ON articles(edition, status, published_at DESC);

PRAGMA optimize;
