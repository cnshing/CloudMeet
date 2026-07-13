-- Add per-event-type scheduling limit controls
-- min_notice_enabled / min_notice_minutes: block bookings within N minutes of now (default 3 days = 4320 min)
-- booking_window_enabled / booking_window_days: block bookings more than N days out (default 1 month = 30 days)
-- Both are OFF by default so existing event types are unaffected.

ALTER TABLE event_types ADD COLUMN min_notice_enabled BOOLEAN DEFAULT 0;
ALTER TABLE event_types ADD COLUMN min_notice_minutes INTEGER DEFAULT 4320;
ALTER TABLE event_types ADD COLUMN booking_window_enabled BOOLEAN DEFAULT 0;
ALTER TABLE event_types ADD COLUMN booking_window_days INTEGER DEFAULT 30;
