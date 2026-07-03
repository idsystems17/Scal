ALTER TABLE clientes
  ADD COLUMN IF NOT EXISTS kiwify_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS trial_expira_em TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');

CREATE INDEX IF NOT EXISTS idx_clientes_kiwify ON clientes(kiwify_subscription_id) WHERE kiwify_subscription_id IS NOT NULL;
