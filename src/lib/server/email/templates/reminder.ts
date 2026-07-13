/**
 * Reminder email templates.
 *
 * Fully rich-text / host-editable: the entire email body is either the
 * host's custom rich-text message (sanitized, with {variables} substituted,
 * including {reminder_time}) or a plain default body if the host hasn't
 * customized it yet. There is no fixed HTML wrapper, CSS, or CTA buttons.
 *
 * Note: `reminder_30m` remains in the type system / DB schema but is not
 * currently scheduled anywhere in the booking/reschedule flows — left as-is
 * per product decision.
 */

import type { BookingEmailData } from '../types';
import { sanitizeEmailHtml, htmlToPlainText } from '../sanitize';
import { applyEmailVariables, buildReminderVariables } from '../template-variables';

type ReminderType = 'reminder_24h' | 'reminder_1h' | 'reminder_30m';

const TIME_LABELS: Record<ReminderType, string> = {
	'reminder_24h': 'tomorrow',
	'reminder_1h': 'in 1 hour',
	'reminder_30m': 'in 30 minutes'
};

const DEFAULT_REMINDER_BODY = `
<p>Hi {attendee_name},</p>
<p>This is a friendly reminder that your meeting with {host_name} is coming up {reminder_time}.</p>
<p><strong>{event_name}</strong><br>
{date}<br>
{time}</p>
<p>Join meeting: <a href="{meeting_url}">{meeting_url}</a></p>
<p>Need to make changes? <a href="{reschedule_url}">Reschedule</a> or <a href="{cancel_url}">Cancel</a>.</p>
`.trim();

/**
 * Generate HTML email for reminders.
 */
export function generateReminderEmail(data: BookingEmailData, reminderType: ReminderType): string {
	const vars = buildReminderVariables(data, TIME_LABELS[reminderType]);
	const body = data.customMessage && data.customMessage.trim().length > 0
		? sanitizeEmailHtml(data.customMessage)
		: DEFAULT_REMINDER_BODY;

	return applyEmailVariables(body, vars);
}

/**
 * Generate plain text version of the reminder email, derived from the same
 * HTML content sent to the attendee.
 */
export function generateReminderEmailText(data: BookingEmailData, reminderType: ReminderType): string {
	return htmlToPlainText(generateReminderEmail(data, reminderType));
}

/**
 * Get default reminder subjects
 */
export function getDefaultReminderSubject(data: BookingEmailData, reminderType: ReminderType): string {
	const subjects: Record<ReminderType, string> = {
		'reminder_24h': `Reminder: ${data.eventName} tomorrow with ${data.hostName}`,
		'reminder_1h': `Reminder: ${data.eventName} starts in 1 hour`,
		'reminder_30m': `Starting Soon: ${data.eventName} in 30 minutes`
	};
	return subjects[reminderType];
}
