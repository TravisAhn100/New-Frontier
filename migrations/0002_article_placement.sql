ALTER TABLE articles
ADD COLUMN placement TEXT NOT NULL DEFAULT 'main'
CHECK (placement IN ('headline', 'main', 'homepage', 'section'));

UPDATE articles
SET placement = 'headline'
WHERE featured = 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_one_published_headline
  ON articles(edition)
  WHERE status = 'published' AND placement = 'headline';

PRAGMA optimize;
