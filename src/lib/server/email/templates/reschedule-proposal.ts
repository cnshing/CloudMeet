/**
 * Reschedule proposal email template (host proposes a new time to attendee).
 *
 * Static, unstyled internal HTML — not exposed to the dashboard.
 * Keeps the same function signature as before.
 */

import type { RescheduleProposalEmailData } from '../types';

export function generateRescheduleProposalEmail(data: RescheduleProposalEmailData): string {
	const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
	const formatTime = (date: Date) => date.toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: '2-digit',
		hour12: data.timeFormat === '12h'
	});

	const messageSection = data.message
		? `<p><strong>Message from ${data.hostName}:</strong><br>${data.message}</p>`
		: '';

	return `
<p>Hi ${data.attendeeName},</p>
<p>${data.hostName} would like to reschedule your meeting to a new time.</p>
${messageSection}
<p><strong>Original time:</strong><br>
${formatDate(data.oldStartTime)}<br>
${formatTime(data.oldStartTime)} \u2013 ${formatTime(data.oldEndTime)}</p>
<p><strong>Proposed time:</strong><br>
${formatDate(data.newStartTime)}<br>
${formatTime(data.newStartTime)} \u2013 ${formatTime(data.newEndTime)}</p>
<p>
  <a href="${data.responseUrl}?action=accept">Accept New Time</a> |
  <a href="${data.responseUrl}?action=decline">Decline</a> |
  <a href="${data.responseUrl}?action=counter">Propose a different time</a>
</p>
<p>This reschedule request was sent by ${data.hostName}.</p>
	`.trim();
}
