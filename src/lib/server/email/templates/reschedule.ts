/**
 * Reschedule email templates
 */

import { root } from '$src/app.css.ts';
import type { RescheduleEmailData } from '../types';
import { createEmailFormatters } from '../formatters';
import {
	generateBaseEmail,
	generateActionButton,
	generateManagementLinks,
	generateYourMessageCard,
	generateAttendeeNotesCard,
	generateTimeComparison,
	badgeRescheduled
} from './base';

/**
 * Generate HTML email for reschedule (sent to attendee)
 */
export function generateRescheduleEmail(data: RescheduleEmailData): string {
	const { formatDate, formatTime } = createEmailFormatters(data.timeFormat, data.timezone);
	const brandColor = data.brandColor || root['--color-primary'];

	const cancelUrl = `${data.appUrl}/cancel/${data.bookingId}`;
	const rescheduleUrl = `${data.appUrl}/reschedule/${data.bookingId}`;

	const customMessageSection = data.customMessage ? `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-surface-2']};border-radius:8px;border-left:3px solid ${root['--color-accent']};margin-bottom:24px;">
  <tr>
    <td style="padding:16px 20px;">
      <div style="color:${root['--color-border-strong']};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Message from ${data.hostName}</div>
      <div style="color:${root['--color-foreground']};font-size:14px;line-height:21px;">${data.customMessage}</div>
    </td>
  </tr>
</table>` : '';

	const attendeeNotesSection = data.attendeeNotes
		? generateYourMessageCard(data.attendeeNotes)
		: '';

	const timeComparison = generateTimeComparison(
		'Previous time',
		`${formatDate(data.oldStartTime)}\n${formatTime(data.oldStartTime)} – ${formatTime(data.oldEndTime)}`,
		'New time',
		`${formatDate(data.startTime)}\n${formatTime(data.startTime)} – ${formatTime(data.endTime)}`
	);

	const meetingLabel = data.meetingType === 'teams' ? 'Join Microsoft Teams Meeting' : 'Join Google Meet';
	const actionButton = data.meetingUrl
		? generateActionButton(data.meetingUrl, meetingLabel, brandColor)
		: '';

	const managementLinks = generateManagementLinks(rescheduleUrl, cancelUrl, brandColor)
		.replace('Reschedule</a>', 'Reschedule Again</a>');

	const bodyContent = `
<p style="margin:0 0 8px;color:${root['--color-muted-foreground']};font-size:16px;line-height:24px;">
  Hi <strong style="color:${root['--color-foreground']};">${data.attendeeName}</strong>,
</p>
<p style="margin:0 0 24px;color:${root['--color-muted-foreground']};font-size:15px;line-height:23px;">
  Your meeting with <strong style="color:${root['--color-foreground']};">${data.hostName}</strong> has been moved to a new time. Your calendar invitation has been updated.
</p>

${customMessageSection}
${attendeeNotesSection}
${timeComparison}
${actionButton}
${managementLinks}
	`.trim();

	return generateBaseEmail({
		title: 'Meeting Rescheduled',
		statusBadge: badgeRescheduled(),
		heading: 'Meeting Rescheduled',
		bodyContent,
		footerContent: `This is an automated email from ${data.hostName}'s meeting scheduler.`
	});
}

/**
 * Generate admin reschedule notification email
 */
export function generateAdminRescheduleEmail(data: RescheduleEmailData): string {
	const { formatDate, formatTime } = createEmailFormatters(data.timeFormat, data.timezone);
	const brandColor = data.brandColor || root['--color-primary'];

	const attendeeNotesSection = data.attendeeNotes
		? generateAttendeeNotesCard(data.attendeeName, data.attendeeNotes)
		: '';

	const timeComparison = generateTimeComparison(
		'Old time',
		`${formatDate(data.oldStartTime)}\n${formatTime(data.oldStartTime)} – ${formatTime(data.oldEndTime)}`,
		'New time',
		`${formatDate(data.startTime)}\n${formatTime(data.startTime)} – ${formatTime(data.endTime)}`
	);

	const adminMeetingLabel = data.meetingType === 'teams' ? 'Join Microsoft Teams Meeting' : 'Join Google Meet';
	const actionButton = data.meetingUrl
		? generateActionButton(data.meetingUrl, adminMeetingLabel, brandColor)
		: '';

	// Attendee info chip
	const attendeeCard = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-background']};border-radius:10px;margin-bottom:24px;">
  <tr>
    <td style="padding:16px 20px;">
      <div style="color:${root['--color-subtle-foreground']};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Attendee</div>
      <div style="color:${root['--color-foreground']};font-size:16px;font-weight:700;">${data.attendeeName}</div>
      <div style="color:${root['--color-muted-foreground']};font-size:14px;margin-top:2px;">${data.attendeeEmail}</div>
      <div style="margin-top:10px;padding-top:10px;border-top:1px solid ${root['--color-surface-2']};">
        <div style="color:${root['--color-subtle-foreground']};font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Event</div>
        <div style="color:${root['--color-foreground']};font-size:15px;font-weight:600;">${data.eventName}</div>
      </div>
    </td>
  </tr>
</table>`.trim();

	const bodyContent = `
<p style="margin:0 0 24px;color:${root['--color-muted-foreground']};font-size:15px;line-height:23px;">
  A booking has been rescheduled.
</p>

${attendeeCard}
${attendeeNotesSection}
${timeComparison}
${actionButton}
	`.trim();

	return generateBaseEmail({
		title: 'Booking Rescheduled',
		statusBadge: badgeRescheduled(),
		heading: 'Booking Rescheduled',
		bodyContent,
		footerContent: `Notification for ${data.hostName}'s meeting scheduler.`
	});
}
