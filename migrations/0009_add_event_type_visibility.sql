-- Add event type visibility controls
-- is_listed = 1 means the active event type appears on the public booking selection page
-- is_listed = 0 means the active event type is unlisted but still accessible by direct URL

ALTER TABLE event_types ADD COLUMN is_listed BOOLEAN DEFAULT 1;
CREATE INDEX IF NOT EXISTS idx_event_types_listed ON event_types(user_id, is_active, is_listed);