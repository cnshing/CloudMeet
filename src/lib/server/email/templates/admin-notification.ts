/**
 * Admin notification email template (new booking)
 */

import { root } from '../../../../app.css';
import type { BookingEmailData } from '../types';
import { createEmailFormatters } from '../formatters';
import {
	generateBaseEmail,
	generateMeetingDetailsCard,
	generateAttendeeNotesCard,
	generateActionButton,
	badgeNewBooking
} from './base';

/**
 * Generate HTML email for admin notification (new booking)
 */
export function generateAdminNotificationEmail(data: BookingEmailData): string {
	const { formatDate, formatTime } = createEmailFormatters(data.timeFormat, data.timezone);
	const brandColor = data.brandColor || root['--color-primary'];

	const meetingLabel = data.meetingType === 'teams' ? 'Join Microsoft Teams Meeting' : 'Join Google Meet';
	const actionButton = data.meetingUrl
		? generateActionButton(data.meetingUrl, meetingLabel, brandColor)
		: '';

	const attendeeNotes = data.attendeeNotes
		? generateAttendeeNotesCard(data.attendeeName, data.attendeeNotes)
		: '';

	// Attendee info chip
	const attendeeCard = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-background']};border-radius:10px;margin-bottom:24px;">
  <tr>
    <td style="padding:16px 20px;">
      <div style="color:${root['--color-subtle-foreground']};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Attendee</div>
      <div style="color:${root['--color-foreground']};font-size:16px;font-weight:700;">${data.attendeeName}</div>
      <div style="color:${root['--color-muted-foreground']};font-size:14px;margin-top:2px;">${data.attendeeEmail}</div>
    </td>
  </tr>
</table>`.trim();

	const meetingDetails = generateMeetingDetailsCard({
		eventName: data.eventName,
		formattedDate: formatDate(data.startTime),
		formattedTime: `${formatTime(data.startTime)} – ${formatTime(data.endTime)}`,
		meetingUrl: data.meetingUrl,
		meetingType: data.meetingType,
		brandColor
	});

	const bodyContent = `
<p style="margin:0 0 24px;color:${root['--color-muted-foreground']};font-size:15px;line-height:23px;">
  You have a new meeting booked!
</p>

${attendeeCard}
${meetingDetails}
${attendeeNotes}
${actionButton}
	`.trim();

	return generateBaseEmail({
		title: 'New Booking',
		statusBadge: badgeNewBooking(),
		heading: 'New Booking!',
		bodyContent,
		footerContent: `Notification for ${data.hostName}'s meeting scheduler.`
	});
}
