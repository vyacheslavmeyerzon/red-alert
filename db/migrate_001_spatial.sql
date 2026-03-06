-- Add spatial centroid column to alerts
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS centroid geometry(Point, 4326);

CREATE INDEX IF NOT EXISTS idx_alerts_centroid ON alerts USING GIST (centroid);
