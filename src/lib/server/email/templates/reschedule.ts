/**
 * Reschedule email templates.
 *
 * - Attendee-facing email: fully rich-text / host-editable (no fixed HTML,
 *   no CSS, no CTA buttons) — mirrors confirmation.ts, with extra
 *   previous-time variables available.
 * - Admin notification email: static, unstyled internal HTML. Not exposed to
 *   the dashboard; keeps the same function signature as before.
 */

import type { RescheduleEmailData } from '../types';
import { createEmailFormatters } from '../formatters';
import { sanitizeEmailHtml, htmlToPlainText } from '../sanitize';
import { applyEmailVariables, buildRescheduleVariables } from '../template-variables';

// ---------------------------------------------------------------------------
// Attendee reschedule email — rich text, host-editable
// ---------------------------------------------------------------------------

const DEFAULT_RESCHEDULE_BODY = `
<p>Hi {attendee_name},</p>
<p>Your meeting with {host_name} has been moved to a new time. Your calendar invitation has been updated.</p>
<p><strong>Previous time:</strong><br>
{previous_date}<br>
{previous_time}</p>
<p><strong>New time:</strong><br>
{date}<br>
{time}</p>
<p>Join meeting: <a href="{meeting_url}">{meeting_url}</a></p>
<p>Need to make changes? <a href="{reschedule_url}">Reschedule again</a> or <a href="{cancel_url}">Cancel</a>.</p>
`.trim();

export function generateRescheduleEmail(data: RescheduleEmailData): string {
	const vars = buildRescheduleVariables(data);
	const body = data.customMessage && data.customMessage.trim().length > 0
		? sanitizeEmailHtml(data.customMessage)
		: DEFAULT_RESCHEDULE_BODY;

	return applyEmailVariables(body, vars);
}

export function generateRescheduleEmailText(data: RescheduleEmailData): string {
	return htmlToPlainText(generateRescheduleEmail(data));
}

// ---------------------------------------------------------------------------
// Admin reschedule notification — static, unstyled internal HTML
// (not dashboard-editable; same function signature as before)
// ---------------------------------------------------------------------------

export function generateAdminRescheduleEmail(data: RescheduleEmailData): string {
	const { formatDate, formatTime } = createEmailFormatters(data.timeFormat, data.timezone);

	const attendeeNotesSection = data.attendeeNotes
		? `<p><strong>Notes from ${data.attendeeName}:</strong><br>${data.attendeeNotes}</p>`
		: '';

	const meetingSection = data.meetingUrl
		? `<p>Join meeting: <a href="${data.meetingUrl}">${data.meetingUrl}</a></p>`
		: '';

	return `
<p>A booking has been rescheduled.</p>
<p><strong>Attendee:</strong> ${data.attendeeName} (${data.attendeeEmail})</p>
<p><strong>Event:</strong> ${data.eventName}</p>
${attendeeNotesSection}
<p><strong>Old time:</strong><br>
${formatDate(data.oldStartTime)}<br>
${formatTime(data.oldStartTime)} \u2013 ${formatTime(data.oldEndTime)}</p>
<p><strong>New time:</strong><br>
${formatDate(data.startTime)}<br>
${formatTime(data.startTime)} \u2013 ${formatTime(data.endTime)}</p>
${meetingSection}
<p>Notification for ${data.hostName}'s meeting scheduler.</p>
	`.trim();
}
