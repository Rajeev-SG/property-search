CREATE TABLE IF NOT EXISTS ingestion_runs (
  run_id text PRIMARY KEY,
  source_id text REFERENCES source_registry (source_id) ON DELETE SET NULL,
  profile_id text REFERENCES site_profiles (profile_id) ON DELETE SET NULL,
  run_kind text NOT NULL,
  scope text NOT NULL,
  trigger text NOT NULL DEFAULT 'manual',
  status text NOT NULL CHECK (status IN ('running', 'succeeded', 'failed', 'partial')),
  provider text,
  page_url text,
  started_at timestamptz NOT NULL,
  completed_at timestamptz,
  artifact_root text NOT NULL DEFAULT 'artifacts',
  run_path text NOT NULL,
  summary_path text NOT NULL,
  artifact_paths jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifacts jsonb NOT NULL DEFAULT '[]'::jsonb,
  error_class text,
  error_detail text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT ingestion_runs_page_url_http CHECK (
    page_url IS NULL OR page_url ~* '^https?://'
  ),
  CONSTRAINT ingestion_runs_started_completed CHECK (
    completed_at IS NULL OR started_at <= completed_at
  )
);

CREATE INDEX IF NOT EXISTS ingestion_runs_source_idx
  ON ingestion_runs (source_id);

CREATE INDEX IF NOT EXISTS ingestion_runs_profile_idx
  ON ingestion_runs (profile_id);

CREATE INDEX IF NOT EXISTS ingestion_runs_status_idx
  ON ingestion_runs (status);

CREATE INDEX IF NOT EXISTS ingestion_runs_started_at_idx
  ON ingestion_runs (started_at DESC);

ALTER TABLE raw_page_artifacts
  ADD COLUMN IF NOT EXISTS run_id text REFERENCES ingestion_runs (run_id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS raw_page_artifacts_run_idx
  ON raw_page_artifacts (run_id);
