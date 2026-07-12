/**
 * Booking confirmation email template
 */

import { root } from '$src/app.css.ts';
import type { BookingEmailData } from '../types';
import { createEmailFormatters } from '../formatters';
import {
	generateBaseEmail,
	generateMeetingDetailsCard,
	generateYourMessageCard,
	generateActionButton,
	generateManagementLinks,
	badgeSuccess
} from './base';

/**
 * Generate HTML email template for booking confirmation
 */
export function generateBookingEmail(data: BookingEmailData): string {
	const { formatDate, formatTime } = createEmailFormatters(data.timeFormat, data.timezone);
	const contactEmail = data.hostContactEmail || data.hostEmail;
	const brandColor = data.brandColor || root['--color-primary'];

	const cancelUrl = `${data.appUrl}/cancel/${data.bookingId}`;
	const rescheduleUrl = `${data.appUrl}/reschedule/${data.bookingId}`;

	const meetingLabel = data.meetingType === 'teams' ? 'Join Microsoft Teams Meeting' : 'Join Google Meet';

	const meetingDetails = generateMeetingDetailsCard({
		eventName: data.eventName,
		hostName: data.hostName,
		eventDescription: data.eventDescription,
		formattedDate: formatDate(data.startTime),
		formattedTime: `${formatTime(data.startTime)} – ${formatTime(data.endTime)}`,
		meetingUrl: data.meetingUrl,
		meetingType: data.meetingType,
		brandColor
	});

	const attendeeNotes = data.attendeeNotes
		? generateYourMessageCard(data.attendeeNotes)
		: '';

	const actionButton = data.meetingUrl
		? generateActionButton(data.meetingUrl, meetingLabel, brandColor)
		: '';

	const managementLinks = generateManagementLinks(rescheduleUrl, cancelUrl, brandColor);

	const bodyContent = `
<p style="margin:0 0 8px;color:${root['--color-muted-foreground']};font-size:16px;line-height:24px;">
  Hi <strong style="color:${root['--color-foreground']};">${data.attendeeName}</strong>,
</p>
<p style="margin:0 0 24px;color:${root['--color-muted-foreground']};font-size:15px;line-height:23px;">
  Your meeting with <strong style="color:${root['--color-foreground']};">${data.hostName}</strong> has been confirmed. A calendar invitation has been sent to your email address.
</p>

${meetingDetails}
${attendeeNotes}
${actionButton}
${managementLinks}

<p style="margin:16px 0 0;color:${root['--color-subtle-foreground']};font-size:13px;line-height:20px;text-align:center;">
  Need to make changes? Reply to this email or contact <a href="mailto:${contactEmail}" style="color:${brandColor};text-decoration:none;">${contactEmail}</a>.
</p>
	`.trim();

	return generateBaseEmail({
		title: 'Meeting Confirmed',
		statusBadge: badgeSuccess(),
		heading: 'You\'re scheduled!',
		bodyContent,
		footerContent: `This is an automated email from ${data.hostName}'s meeting scheduler.`
	});
}

/**
 * Generate plain text version of booking email
 */
export function generateBookingEmailText(data: BookingEmailData): string {
	const { formatDateTime } = createEmailFormatters(data.timeFormat, data.timezone);
	const contactEmail = data.hostContactEmail || data.hostEmail;

	const cancelUrl = `${data.appUrl}/cancel/${data.bookingId}`;
	const rescheduleUrl = `${data.appUrl}/reschedule/${data.bookingId}`;

	return `
You're scheduled!

Hi ${data.attendeeName},

Your meeting with ${data.hostName} has been confirmed. A calendar invitation has been sent to your email address.

MEETING DETAILS
Event: ${data.eventName}
${data.eventDescription ? `Description: ${data.eventDescription}` : ''}
Date & Time: ${formatDateTime(data.startTime)} - ${formatDateTime(data.endTime)}
${data.meetingUrl ? `Location: ${data.meetingUrl}` : ''}

${data.meetingUrl ? `Join Meeting: ${data.meetingUrl}` : ''}

MANAGE YOUR BOOKING
Reschedule: ${rescheduleUrl}
Cancel: ${cancelUrl}

Need to make changes? Reply to this email or contact ${contactEmail}.

---
This is an automated email from ${data.hostName}'s meeting scheduler.
Powered by CloudMeet - https://github.com/cnshing/CloudMeet
	`.trim();
}
