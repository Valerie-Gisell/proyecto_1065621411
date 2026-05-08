CREATE TABLE IF NOT EXISTS categories (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
             -- NULL = global, NOT NULL = personal del usuario
  name       VARCHAR(80) NOT NULL,
  emoji      VARCHAR(10) DEFAULT '💸',
  color      VARCHAR(7)  DEFAULT '#636E72',
  type       VARCHAR(10) NOT NULL DEFAULT 'gasto'
             CHECK (type IN ('ingreso', 'gasto', 'ambos')),
  is_active  BOOLEAN     DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cat_user_name
  ON categories(COALESCE(user_id::text, 'global'), LOWER(name));

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
