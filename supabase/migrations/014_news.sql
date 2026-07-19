-- Notícias module
-- Tabela news: espelha NewsArticle (src/types/index.ts) + controle draft/published.
-- Mantém os valores de category em sync com NewsArticle.category.

CREATE TABLE IF NOT EXISTS news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  cover_image TEXT,
  author TEXT,
  author_photo TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  tags TEXT[] DEFAULT '{}',
  category TEXT NOT NULL CHECK (category IN ('race_report', 'news', 'interview', 'preview', 'analysis')),
  views INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "news_select" ON news;
CREATE POLICY "news_select" ON news
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "news_admin" ON news;
CREATE POLICY "news_admin" ON news
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_news_status ON news (status);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news (featured);
