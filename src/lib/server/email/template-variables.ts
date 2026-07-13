/**
 * Shared {variable} substitution for email subjects and rich-text bodies.
 *
 * Replaces the old subject-only `replaceSubjectVariables` with a single
 * function usable on both subject lines and email bodies, backed by a much
 * larger set of variables pulled from BookingEmailData / RescheduleEmailData.
 *
 * IMPORTANT: When used on a rich-text body, call this *after*
 * `sanitizeEmailHtml()` has already run on the raw editor HTML, so that
 * variable tokens placed inside href="..." attributes (e.g. {cancel_url})
 * survive sanitization untouched and are only substituted at the very end.
 */

import type { BookingEmailData, RescheduleEmailData, RescheduleProposalEmailData } from './types';
import { createEmailFormatters } from './formatters';

export interface EmailVariableMap {
	[key: string]: string;
}

function escapeRegExp(literal: string): string {
	return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replace every {variable_name} token found in `text` with its value from
 * `vars`. Unknown/missing variables are left untouched (rather than removed)
 * so authors can spot typos.
 */
export function applyEmailVariables(text: string, vars: EmailVariableMap): string {
	if (!text) return text;

	let out = text;
	for (const [name, value] of Object.entries(vars)) {
		const pattern = new RegExp(`\\{${escapeRegExp(name)}\\}`, 'g');
		out = out.replace(pattern, value ?? '');
	}
	return out;
}

/**
 * Build the base variable set shared by confirmation / cancellation /
 * reminder emails (anything driven by BookingEmailData).
 */
export function buildBookingVariables(data: BookingEmailData): EmailVariableMap {
	const { formatDate, formatTime, formatDateTime } = createEmailFormatters(data.timeFormat, data.timezone);

	const cancelUrl = `${data.appUrl}/cancel/${data.bookingId}`;
	const rescheduleUrl = `${data.appUrl}/reschedule/${data.bookingId}`;

	return {
		event_name: data.eventName,
		event_description: data.eventDescription || '',
		host_name: data.hostName,
		host_email: data.hostEmail,
		attendee_name: data.attendeeName,
		attendee_email: data.attendeeEmail,
		date: formatDate(data.startTime),
		time: `${formatTime(data.startTime)} \u2013 ${formatTime(data.endTime)}`,
		start_time: formatTime(data.startTime),
		end_time: formatTime(data.endTime),
		meeting_url: data.meetingUrl || '',
		attendee_notes: data.attendeeNotes || '',
		cancellation_reason: data.cancellationReason || '',
		cancel_url: cancelUrl,
		reschedule_url: rescheduleUrl
	};
}


/**
 * Extra variables available on reschedule emails (old vs new time).
 */
export function buildRescheduleVariables(data: RescheduleEmailData): EmailVariableMap {
	const { formatDate, formatTime, formatDateTime } = createEmailFormatters(data.timeFormat, data.timezone);

	return {
		...buildBookingVariables(data),
		previous_date: formatDate(data.oldStartTime),
		previous_time: `${formatTime(data.oldStartTime)} \u2013 ${formatTime(data.oldEndTime)}`,
		previous_start_time: formatTime(data.oldStartTime),
		previous_end_time: formatTime(data.oldEndTime)
	};
}

/**
 * Extra variable available on reminder emails (human-readable time-until label).
 */
export function buildReminderVariables(
	data: BookingEmailData,
	reminderLabel: string
): EmailVariableMap {
	return {
		...buildBookingVariables(data),
		reminder_time: reminderLabel
	};
}

/**
 * Variables available on host-initiated reschedule proposal emails.
 *
 * Includes the original booking time, the proposed new time, response-action
 * URLs (accept / decline / counter), and the optional one-off message the
 * host typed when sending the proposal ({proposal_message}).
 */
export function buildRescheduleProposalVariables(data: RescheduleProposalEmailData): EmailVariableMap {
	const { formatDate, formatTime } = createEmailFormatters(data.timeFormat);

	const acceptUrl = `${data.responseUrl}?action=accept`;
	const declineUrl = `${data.responseUrl}?action=decline`;
	const counterUrl = `${data.responseUrl}?action=counter`;

	return {
		attendee_name: data.attendeeName,
		attendee_email: data.attendeeEmail,
		host_name: data.hostName,
		host_email: data.hostEmail,
		event_name: data.eventName,
		// Original (old) booking time
		old_date: formatDate(data.oldStartTime),
		old_time: `${formatTime(data.oldStartTime)} \u2013 ${formatTime(data.oldEndTime)}`,
		old_start_time: formatTime(data.oldStartTime),
		old_end_time: formatTime(data.oldEndTime),
		// Proposed (new) booking time
		proposed_date: formatDate(data.newStartTime),
		proposed_time: `${formatTime(data.newStartTime)} \u2013 ${formatTime(data.newEndTime)}`,
		proposed_start_time: formatTime(data.newStartTime),
		proposed_end_time: formatTime(data.newEndTime),
		// Response action links
		response_url: data.responseUrl,
		accept_url: acceptUrl,
		decline_url: declineUrl,
		counter_url: counterUrl,
		// One-off message the host typed when sending the proposal (empty string if absent)
		proposal_message: data.message || ''
	};
}
