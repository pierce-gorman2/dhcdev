-- DHC Buildout Tracker schema (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  target_open_date TEXT,
  status TEXT NOT NULL DEFAULT 'pre-buildout'
    CHECK (status IN ('pre-buildout', 'in-progress', 'final-prep', 'open')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  industry TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS store_vendors (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not-started'
    CHECK (status IN ('not-started', 'in-progress', 'scheduled', 'blocked', 'complete')),
  notes TEXT,
  contact_name_override TEXT,
  phone_override TEXT,
  email_override TEXT,
  last_updated TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (store_id, vendor_id)
);

CREATE TABLE IF NOT EXISTS update_log (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  store_vendor_id TEXT REFERENCES store_vendors(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT NOT NULL DEFAULT 'admin'
);

CREATE INDEX IF NOT EXISTS idx_store_vendors_store ON store_vendors(store_id);
CREATE INDEX IF NOT EXISTS idx_store_vendors_vendor ON store_vendors(vendor_id);
CREATE INDEX IF NOT EXISTS idx_update_log_store ON update_log(store_id);
CREATE INDEX IF NOT EXISTS idx_update_log_store_vendor ON update_log(store_vendor_id);
