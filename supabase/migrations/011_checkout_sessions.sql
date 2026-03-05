CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  email TEXT,
  mode TEXT, -- 'subscription' or 'payment'
  amount_total INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS checkout_sessions_email_idx ON checkout_sessions(email);
CREATE INDEX IF NOT EXISTS checkout_sessions_customer_idx ON checkout_sessions(stripe_customer_id);
