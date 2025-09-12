-- Migration: Create consolidated maintenance system
-- This consolidates the existing property_maintenance_tasks into a master maintenance_tasks system

-- Master maintenance tasks table (seasons-based, not property-specific)
CREATE TABLE IF NOT EXISTS maintenance_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  seasons TEXT[] NOT NULL CHECK (array_length(seasons,1) > 0 AND seasons <@ ARRAY['Vinter','Vår','Sommer','Høst']),
  property_types TEXT[] NOT NULL CHECK (array_length(property_types,1) > 0 AND property_types <@ ARRAY['Enebolig','Rekkehus','Leilighet','Tomannsbolig','Fritidsbolig']),
  frequency_months INTEGER NOT NULL CHECK (frequency_months > 0),
  priority TEXT NOT NULL CHECK (priority IN ('Høy','Middels','Lav')),
  estimated_time INTERVAL,
  cost_estimate NUMERIC,
  version TEXT NOT NULL DEFAULT '0.1.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mt_seasons ON maintenance_tasks USING gin (seasons);
CREATE INDEX IF NOT EXISTS idx_mt_types ON maintenance_tasks USING gin (property_types);

-- Touch trigger for updated_at
CREATE OR REPLACE FUNCTION touch_updated_at_mt() RETURNS TRIGGER AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS t_touch_mt ON maintenance_tasks;
CREATE TRIGGER t_touch_mt BEFORE UPDATE ON maintenance_tasks FOR EACH ROW EXECUTE FUNCTION touch_updated_at_mt();

-- RLS policies
ALTER TABLE maintenance_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS mt_read_all ON maintenance_tasks;
CREATE POLICY mt_read_all ON maintenance_tasks FOR SELECT USING (true);

DROP POLICY IF EXISTS mt_admin_write ON maintenance_tasks;
CREATE POLICY mt_admin_write ON maintenance_tasks
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role IN ('admin','master_admin')))
WITH CHECK (EXISTS (SELECT 1 FROM user_profiles up WHERE up.user_id = auth.uid() AND up.role IN ('admin','master_admin')));

-- User completion log
CREATE TABLE IF NOT EXISTS user_task_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  task_id UUID NOT NULL REFERENCES maintenance_tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  note TEXT,
  UNIQUE (user_id, task_id, completed_at)
);

CREATE INDEX IF NOT EXISTS idx_utl_user_task ON user_task_log(user_id, task_id);

ALTER TABLE user_task_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY utl_read_self ON user_task_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY utl_write_self ON user_task_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Due-tasks function (season + frequency + last completed)
CREATE OR REPLACE FUNCTION maint_due_tasks(p_user UUID, p_season TEXT)
RETURNS TABLE (
  task_id UUID, 
  title TEXT, 
  description TEXT, 
  priority TEXT, 
  frequency_months INTEGER, 
  last_completed TIMESTAMPTZ, 
  is_due BOOLEAN
)
LANGUAGE SQL STABLE AS $$
  WITH latest AS (
    SELECT task_id, max(completed_at) AS last_completed 
    FROM user_task_log 
    WHERE user_id = p_user 
    GROUP BY task_id
  )
  SELECT 
    t.id, 
    t.title, 
    t.description, 
    t.priority, 
    t.frequency_months,
    l.last_completed,
    COALESCE((now() - COALESCE(l.last_completed, to_timestamp(0))) > make_interval(months => t.frequency_months), true) AS is_due
  FROM maintenance_tasks t
  LEFT JOIN latest l ON l.task_id = t.id
  WHERE p_season = ANY (t.seasons)
$$;

-- Versioned export view for docs generator
CREATE OR REPLACE VIEW maintenance_export_v AS
SELECT 
  version,
  jsonb_agg(jsonb_build_object(
    'id', id,
    'title', title,
    'description', description,
    'seasons', seasons,
    'property_types', property_types,
    'frequency_months', frequency_months,
    'priority', priority,
    'estimated_time', estimated_time,
    'cost_estimate', cost_estimate
  ) ORDER BY title) AS tasks
FROM maintenance_tasks
GROUP BY version;

-- Seed some initial tasks for testing
INSERT INTO maintenance_tasks (title, description, seasons, property_types, frequency_months, priority, estimated_time, cost_estimate) VALUES
('Rengjøre takrenner', 'Fjern løv, søppel og tette stopper fra takrenner og nedløpsrør', ARRAY['Høst'], ARRAY['Enebolig','Rekkehus','Tomannsbolig'], 12, 'Høy', '2 hours', 500),
('Sjekke røykvarslere', 'Test alle røykvarslere og skift batterier om nødvendig', ARRAY['Vinter','Sommer'], ARRAY['Enebolig','Rekkehus','Leilighet','Tomannsbolig','Fritidsbolig'], 6, 'Høy', '30 minutes', 200),
('Vinterforberede vannkraner', 'Tøm og isoler utvendige vannkraner før frost', ARRAY['Høst'], ARRAY['Enebolig','Rekkehus','Tomannsbolig','Fritidsbolig'], 12, 'Høy', '1 hour', 0),
('Sjekke ventilasjon', 'Rengjør ventilasjonsgitter og sjekk luftstrøm', ARRAY['Vinter','Sommer'], ARRAY['Enebolig','Rekkehus','Leilighet','Tomannsbolig'], 6, 'Middels', '1 hour', 300),
('Trimme hekker og busker', 'Beskjæring av hekker og busker rundt eiendommen', ARRAY['Vår','Høst'], ARRAY['Enebolig','Rekkehus','Tomannsbolig','Fritidsbolig'], 6, 'Middels', '3 hours', 800)
ON CONFLICT DO NOTHING;