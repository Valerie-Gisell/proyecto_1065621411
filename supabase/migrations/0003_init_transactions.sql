CREATE TABLE IF NOT EXISTS transactions (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id   UUID          REFERENCES categories(id) ON DELETE SET NULL,
  type          VARCHAR(10)   NOT NULL CHECK (type IN ('ingreso', 'gasto')),
  amount        DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  description   VARCHAR(200),
  transaction_date DATE       NOT NULL,
  emotion       VARCHAR(15)   CHECK (emotion IN ('feliz', 'tranquilo', 'triste', 'estresado', 'emocionado')),
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_user_date    ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_user_type    ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_tx_user_emotion ON transactions(user_id, emotion)
  WHERE emotion IS NOT NULL;
