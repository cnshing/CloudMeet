/**
 * Cancellation email templates
 *
 * Colour rule: RED is reserved exclusively for destructive action links/buttons
 * (e.g. the "Cancel" management link). Informational labels and the cancelled
 * meeting card use --color-subtle-foreground.
 */

import { root } from '$src/app.css.ts';
import type { BookingEmailData } from '../types';
import { createEmailFormatters } from '../formatters';
import { generateBaseEmail, generateActionButton, badgeCancelled } from './base';

// ---------------------------------------------------------------------------
// Shared: cancelled meeting detail card
// Identical styling used in both the attendee and admin emails.
// ---------------------------------------------------------------------------

function buildCancelledMeetingCard(
	eventName: string,
	formattedDate: string,
	formattedTime: string
): string {
	const calendarIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${root['--color-subtle-foreground']}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`;
	const clockIcon    = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${root['--color-subtle-foreground']}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;

	return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-background']};border-radius:12px;margin-bottom:24px;">
  <tr>
    <td style="padding:20px 24px;">
      <!-- Struck-through event name -->
      <div style="font-size:16px;font-weight:700;color:${root['--color-subtle-foreground']};margin-bottom:16px;text-decoration:line-through;">${eventName}</div>
      <!-- Date + time rows with icons — same structure as the attendee card -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:0 0 12px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:top;padding-right:12px;">${calendarIcon}</td>
              <td style="vertical-align:top;">
                <div style="color:${root['--color-subtle-foreground']};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Was scheduled for</div>
                <div style="color:${root['--color-subtle-foreground']};font-size:15px;font-weight:500;text-decoration:line-through;">${formattedDate}</div>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:top;padding-right:12px;">${clockIcon}</td>
              <td style="vertical-align:top;">
                <div style="color:${root['--color-subtle-foreground']};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:2px;">Time</div>
                <div style="color:${root['--color-subtle-foreground']};font-size:15px;font-weight:500;text-decoration:line-through;">${formattedTime}</div>
              </td>
            </tr></table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();
}

// ---------------------------------------------------------------------------
// Attendee cancellation email
// ---------------------------------------------------------------------------

export function generateCancellationEmail(data: BookingEmailData): string {
	const { formatDate, formatTime } = createEmailFormatters(data.timeFormat, data.timezone);
	const brandColor = data.brandColor || root['--color-primary'];

	// Custom message card: neutral bg, subtle left-border and label
	const customMessageSection = data.customMessage
		? `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-surface-2']};border-radius:8px;border-left:3px solid ${root['--color-border-medium']};margin-bottom:24px;">
  <tr>
    <td style="padding:14px 18px;">
      <div style="color:${root['--color-subtle-foreground']};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px;">Message from ${data.hostName}</div>
      <div style="color:${root['--color-foreground']};font-size:14px;line-height:21px;">${data.customMessage}</div>
    </td>
  </tr>
</table>`
		: '';

	const cancelledMeetingCard = buildCancelledMeetingCard(
		data.eventName,
		formatDate(data.startTime),
		`${formatTime(data.startTime)} – ${formatTime(data.endTime)}`
	);

	const rebookButton = data.eventSlug
		? generateActionButton(`${data.appUrl}/${data.eventSlug}`, 'Book Another Time', brandColor)
		: '';

	const bodyContent = `
<p style="margin:0 0 8px;color:${root['--color-muted-foreground']};font-size:16px;line-height:24px;">
  Hi <strong style="color:${root['--color-foreground']};">${data.attendeeName}</strong>,
</p>
<p style="margin:0 0 24px;color:${root['--color-muted-foreground']};font-size:15px;line-height:23px;">
  Your meeting with <strong style="color:${root['--color-foreground']};">${data.hostName}</strong> has been cancelled.
</p>

${customMessageSection}
${cancelledMeetingCard}
${rebookButton}

<p style="margin:0;color:${root['--color-subtle-foreground']};font-size:13px;line-height:20px;text-align:center;">
  Want to schedule again? Visit <a href="${data.appUrl}/${data.eventSlug || ''}" style="color:${brandColor};text-decoration:none;">${data.hostName}'s booking page</a>.
</p>
	`.trim();

	return generateBaseEmail({
		title: 'Meeting Cancelled',
		statusBadge: badgeCancelled(),
		heading: 'Meeting Cancelled',
		bodyContent,
		footerContent: `This is an automated email from ${data.hostName}'s meeting scheduler.`
	});
}

// ---------------------------------------------------------------------------
// Admin cancellation notification
// ---------------------------------------------------------------------------

export function generateAdminCancellationEmail(data: BookingEmailData): string {
	const { formatDate, formatTime } = createEmailFormatters(data.timeFormat, data.timezone);

	// Custom message: neutral bg, subtle border/label
	const customMessageSection = data.customMessage
		? `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-surface-2']};border-radius:8px;border-left:3px solid ${root['--color-border-medium']};margin-bottom:24px;">
  <tr>
    <td style="padding:14px 18px;">
      <div style="color:${root['--color-subtle-foreground']};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px;">Cancellation reason</div>
      <div style="color:${root['--color-foreground']};font-size:14px;line-height:21px;">${data.customMessage}</div>
    </td>
  </tr>
</table>`
		: '';

	// Attendee info block (name + email)
	const attendeeInfoCard = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-background']};border-radius:12px;margin-bottom:16px;">
  <tr>
    <td style="padding:20px 24px;">
      <div style="color:${root['--color-subtle-foreground']};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:5px;">Attendee</div>
      <div style="color:${root['--color-foreground']};font-size:16px;font-weight:700;">${data.attendeeName}</div>
      <div style="color:${root['--color-muted-foreground']};font-size:14px;margin-top:2px;">${data.attendeeEmail}</div>
    </td>
  </tr>
</table>`.trim();

	// Cancelled meeting card — identical CSS to the attendee email
	const cancelledMeetingCard = buildCancelledMeetingCard(
		data.eventName,
		formatDate(data.startTime),
		`${formatTime(data.startTime)} – ${formatTime(data.endTime)}`
	);

	const bodyContent = `
<p style="margin:0 0 24px;color:${root['--color-muted-foreground']};font-size:15px;line-height:23px;">
  A booking has been cancelled.
</p>

${attendeeInfoCard}
${cancelledMeetingCard}
${customMessageSection}
	`.trim();

	return generateBaseEmail({
		title: 'Booking Cancelled',
		statusBadge: badgeCancelled(),
		heading: 'Booking Cancelled',
		bodyContent,
		footerContent: `Notification for ${data.hostName}'s meeting scheduler.`
	});
}
