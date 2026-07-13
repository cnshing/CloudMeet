/**
 * Cancellation email templates.
 *
 * - Attendee-facing email: fully rich-text / host-editable (no fixed HTML,
 *   no CSS, no CTA buttons) — mirrors confirmation.ts.
 * - Admin notification email: static, unstyled internal HTML. Not exposed to
 *   the dashboard; keeps the same function signature as before.
 */

import type { BookingEmailData } from '../types';
import { createEmailFormatters } from '../formatters';
import { sanitizeEmailHtml, htmlToPlainText } from '../sanitize';
import { applyEmailVariables, buildBookingVariables } from '../template-variables';

// ---------------------------------------------------------------------------
// Attendee cancellation email — rich text, host-editable
// ---------------------------------------------------------------------------

const DEFAULT_CANCELLATION_BODY = `
<p>Hi {attendee_name},</p>
<p>Your meeting with {host_name} has been cancelled.</p>
<p>{cancellation_reason}</p>
<p><strong>{event_name}</strong><br>
Was scheduled for {date}<br>
{time}</p>
<p>Want to schedule again? Use the link below to book another time.</p>
`.trim();


export function generateCancellationEmail(data: BookingEmailData): string {
	const vars = buildBookingVariables(data);
	const body = data.customMessage && data.customMessage.trim().length > 0
		? sanitizeEmailHtml(data.customMessage)
		: DEFAULT_CANCELLATION_BODY;

	return applyEmailVariables(body, vars);
}

export function generateCancellationEmailText(data: BookingEmailData): string {
	return htmlToPlainText(generateCancellationEmail(data));
}

// ---------------------------------------------------------------------------
// Admin cancellation notification — static, unstyled internal HTML
// (not dashboard-editable; same function signature as before)
// ---------------------------------------------------------------------------

export function generateAdminCancellationEmail(data: BookingEmailData): string {
	const { formatDate, formatTime } = createEmailFormatters(data.timeFormat, data.timezone);

	const customMessageSection = data.customMessage
		? `<p><strong>Cancellation reason:</strong><br>${data.customMessage}</p>`
		: '';

	return `
<p>A booking has been cancelled.</p>
<p><strong>Attendee:</strong> ${data.attendeeName} (${data.attendeeEmail})</p>
<p><strong>${data.eventName}</strong><br>
Was scheduled for ${formatDate(data.startTime)}<br>
${formatTime(data.startTime)} \u2013 ${formatTime(data.endTime)}</p>
${customMessageSection}
<p>Notification for ${data.hostName}'s meeting scheduler.</p>
	`.trim();
}
