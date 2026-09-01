-- Incremental migration for databases created before milestones existed.
-- Fresh installs get this from schema.sql already; this is for the live DB.

ALTER TABLE stores ADD COLUMN construction_start_date TEXT;

CREATE TABLE IF NOT EXISTS milestones (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_milestones_store ON milestones(store_id);
