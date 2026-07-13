/**
 * Admin notification email template (new booking).
 *
 * Static, unstyled internal HTML — not exposed to the dashboard.
 * Keeps the same function signature as before.
 */

import type { BookingEmailData } from '../types';
import { createEmailFormatters } from '../formatters';

/**
 * Generate HTML email for admin notification (new booking)
 */
export function generateAdminNotificationEmail(data: BookingEmailData): string {
	const { formatDate, formatTime } = createEmailFormatters(data.timeFormat, data.timezone);

	const attendeeNotesSection = data.attendeeNotes
		? `<p><strong>Notes from ${data.attendeeName}:</strong><br>${data.attendeeNotes}</p>`
		: '';

	const meetingSection = data.meetingUrl
		? `<p>Join meeting: <a href="${data.meetingUrl}">${data.meetingUrl}</a></p>`
		: '';

	return `
<p>You have a new meeting booked!</p>
<p><strong>Attendee:</strong> ${data.attendeeName} (${data.attendeeEmail})</p>
<p><strong>${data.eventName}</strong><br>
${formatDate(data.startTime)}<br>
${formatTime(data.startTime)} \u2013 ${formatTime(data.endTime)}</p>
${attendeeNotesSection}
${meetingSection}
<p>Notification for ${data.hostName}'s meeting scheduler.</p>
	`.trim();
}
