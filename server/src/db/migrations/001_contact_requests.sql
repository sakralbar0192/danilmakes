CREATE TABLE IF NOT EXISTS contact_requests (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    contact     VARCHAR(255) NOT NULL,
    message     TEXT NOT NULL,
    budget      VARCHAR(100),
    status      VARCHAR(50) DEFAULT 'new',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_created ON contact_requests(created_at DESC);
