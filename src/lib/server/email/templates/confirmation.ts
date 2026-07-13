/**
 * Booking confirmation email template.
 *
 * Fully rich-text / host-editable: the entire email body is either the
 * host's custom rich-text message (sanitized, with {variables} substituted)
 * or a plain default body if the host hasn't customized it yet. There is no
 * fixed HTML wrapper, CSS, or CTA buttons — the host controls the content
 * completely via the dashboard's WYSIWYG editor.
 */

import type { BookingEmailData } from '../types';
import { sanitizeEmailHtml, htmlToPlainText } from '../sanitize';
import { applyEmailVariables, buildBookingVariables } from '../template-variables';

const DEFAULT_CONFIRMATION_BODY = `
<p>Hi {attendee_name},</p>
<p>Your meeting with {host_name} has been confirmed. A calendar invitation has been sent to your email address.</p>
<p><strong>{event_name}</strong><br>
{date}<br>
{time}</p>
<p>Join meeting: <a href="{meeting_url}">{meeting_url}</a></p>
<p>Need to make changes? <a href="{reschedule_url}">Reschedule</a> or <a href="{cancel_url}">Cancel</a>.</p>
`.trim();

/**
 * Generate HTML email for booking confirmation.
 */
export function generateBookingEmail(data: BookingEmailData): string {
	const vars = buildBookingVariables(data);
	const body = data.customMessage && data.customMessage.trim().length > 0
		? sanitizeEmailHtml(data.customMessage)
		: DEFAULT_CONFIRMATION_BODY;

	return applyEmailVariables(body, vars);
}

/**
 * Generate plain text version of the booking confirmation email, derived
 * from the same HTML content sent to the attendee.
 */
export function generateBookingEmailText(data: BookingEmailData): string {
	return htmlToPlainText(generateBookingEmail(data));
}
