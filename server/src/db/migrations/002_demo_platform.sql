-- Demo platform tables (synthetic data for portfolio demos)

CREATE TABLE IF NOT EXISTS demo_tariff_overlays (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO demo_tariff_overlays (id, payload)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS demo_revenue_plans (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO demo_revenue_plans (id, payload)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS demo_once_hotels (
    hotel_id INTEGER PRIMARY KEY,
    deadline_calc_mode SMALLINT NOT NULL DEFAULT 0,
    fixed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS demo_once_jobs (
    id SERIAL PRIMARY KEY,
    mode TEXT NOT NULL CHECK (mode IN ('dry_run', 'apply')),
    status TEXT NOT NULL DEFAULT 'pending',
    start_hotel_id INTEGER NOT NULL DEFAULT 1,
    cursor_hotel_id INTEGER NOT NULL DEFAULT 1,
    processed INTEGER NOT NULL DEFAULT 0,
    fixed_count INTEGER NOT NULL DEFAULT 0,
    log JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS demo_once_hotels_fixed_idx ON demo_once_hotels (fixed);
