-- Enable trigram extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Festivals table (cached lineups)
CREATE TABLE IF NOT EXISTS festivals (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  year INT NOT NULL,
  location TEXT,
  dates TEXT,
  country TEXT,
  genre TEXT,
  artists JSONB NOT NULL DEFAULT '[]',
  search_keys TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name, year)
);

-- Festival tracks cache (pre-fetched Spotify data)
CREATE TABLE IF NOT EXISTS festival_tracks (
  id SERIAL PRIMARY KEY,
  festival_id INT REFERENCES festivals(id) ON DELETE CASCADE,
  tracks JSONB NOT NULL DEFAULT '[]',
  artist_results JSONB NOT NULL DEFAULT '[]',
  total_duration_ms BIGINT DEFAULT 0,
  not_found_artists TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(festival_id)
);

-- Index for fuzzy search on festival name
CREATE INDEX IF NOT EXISTS idx_festivals_name_trgm ON festivals USING GIN (name gin_trgm_ops);
-- Index for search keys array
CREATE INDEX IF NOT EXISTS idx_festivals_search_keys ON festivals USING GIN (search_keys);
-- Index for year
CREATE INDEX IF NOT EXISTS idx_festivals_year ON festivals (year);
