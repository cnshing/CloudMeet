-- Migration: Add reschedule_proposal to allowed email template types
-- The original CHECK constraint on email_templates did not include 'reschedule_proposal'.
-- SQLite does not support modifying CHECK constraints via ALTER TABLE, so we
-- recreate the table with the updated constraint.

CREATE TABLE email_templates_new (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    template_type TEXT NOT NULL CHECK (template_type IN (
        'confirmation', 'cancellation', 'reschedule', 'reschedule_proposal',
        'reminder_24h', 'reminder_1h', 'reminder_30m'
    )),
    is_enabled BOOLEAN DEFAULT 1,
    subject TEXT,
    custom_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, template_type)
);

INSERT INTO email_templates_new SELECT * FROM email_templates;

DROP INDEX IF EXISTS idx_email_templates_user;
DROP TABLE email_templates;

ALTER TABLE email_templates_new RENAME TO email_templates;

CREATE INDEX IF NOT EXISTS idx_email_templates_user ON email_templates(user_id);
