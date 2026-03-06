CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    oref_id VARCHAR(64) UNIQUE NOT NULL,
    category INTEGER NOT NULL DEFAULT 1,
    category_desc VARCHAR(255),
    title VARCHAR(512),
    description TEXT,
    cities TEXT[] NOT NULL DEFAULT '{}',
    raw_json JSONB,
    alerted_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    centroid_lat DOUBLE PRECISION,
    centroid_lon DOUBLE PRECISION,
    centroid geometry(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_alerts_alerted_at ON alerts (alerted_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts (category);
CREATE INDEX IF NOT EXISTS idx_alerts_oref_id ON alerts (oref_id);
CREATE INDEX IF NOT EXISTS idx_alerts_cities ON alerts USING GIN (cities);
CREATE INDEX IF NOT EXISTS idx_alerts_centroid ON alerts USING GIST (centroid);

-- Stats view for quick dashboard queries
CREATE OR REPLACE VIEW alert_stats_daily AS
SELECT
    DATE(alerted_at) AS day,
    category,
    category_desc,
    COUNT(*) AS alert_count,
    array_agg(DISTINCT unnest_city) AS affected_cities
FROM alerts, unnest(cities) AS unnest_city
GROUP BY DATE(alerted_at), category, category_desc
ORDER BY day DESC;
