/**
 * Reminder email templates
 */

import { root } from '../../../../app.css';
import type { BookingEmailData } from '../types';
import { createEmailFormatters } from '../formatters';
import {
	generateBaseEmail,
	generateActionButton,
	generateManagementLinks,
	badgeReminder
} from './base';

type ReminderType = 'reminder_24h' | 'reminder_1h' | 'reminder_30m';

const TIME_LABELS: Record<ReminderType, string> = {
	'reminder_24h': 'tomorrow',
	'reminder_1h': 'in 1 hour',
	'reminder_30m': 'in 30 minutes'
};

/**
 * Urgency colour scheme per reminder tier.
 *
 * Rules applied:
 *   - No all-coloured cards: coloured bg only for the one most-important card
 *     per email (24h uses accent-subtle), others use neutral bg
 *   - Labels use a tinted colour (green / red / subtle), values use foreground
 *
 * 24h (low)    — accent-subtle bg (the ONE coloured card), green label, foreground value
 * 1h  (medium) — background bg (neutral), subtle-foreground label, foreground value
 * 30m (high)   — surface-2 bg (neutral), subtle-foreground label, foreground value
 */
const URGENCY: Record<ReminderType, {
	badgeBg:        string;
	badgeIcon:      string;
	cardBg:         string;
	cardLabel:      string;   // small-caps label text colour
	cardValue:      string;   // large/bold value text colour
}> = {
	'reminder_24h': {
		badgeBg:    root['--color-accent-subtle'],
		badgeIcon:  root['--color-border-strong'],
		cardBg:     root['--color-accent-subtle'],   // one green bg card per email
		cardLabel:  root['--color-border-strong'],
		cardValue:  root['--color-foreground']
	},
	'reminder_1h': {
		badgeBg:    root['--color-surface-2'],
		badgeIcon:  root['--color-foreground'],
		cardBg:     root['--color-surface-2'],      // neutral
		cardLabel:  root['--color-subtle-foreground'],
		cardValue:  root['--color-foreground']
	},
	'reminder_30m': {
		badgeBg:    root['--color-surface-2'],        // neutral — red reserved for action buttons only
		badgeIcon:  root['--color-foreground'],
		cardBg:     root['--color-surface-2'],        // neutral
		cardLabel:  root['--color-subtle-foreground'],
		cardValue:  root['--color-foreground']
	}
};

/**
 * Generate HTML email for reminders
 */
export function generateReminderEmail(data: BookingEmailData, reminderType: ReminderType): string {
	const { formatDate, formatTime } = createEmailFormatters(data.timeFormat, data.timezone);
	const brandColor = data.brandColor || root['--color-primary'];

	const cancelUrl = `${data.appUrl}/cancel/${data.bookingId}`;
	const rescheduleUrl = `${data.appUrl}/reschedule/${data.bookingId}`;

	const urgency = URGENCY[reminderType];
	const timeLabel = TIME_LABELS[reminderType];

	// Custom message: neutral bg, accented label, foreground body
	const customMessageSection = data.customMessage ? `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-surface-2']};border-radius:8px;border-left:3px solid ${brandColor};margin-bottom:24px;">
  <tr>
    <td style="padding:14px 18px;">
      <div style="color:${root['--color-border-strong']};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:5px;">Message from ${data.hostName}</div>
      <div style="color:${root['--color-foreground']};font-size:14px;line-height:21px;">${data.customMessage}</div>
    </td>
  </tr>
</table>` : '';

	// Meeting summary card — icons match urgency label colour
	const calendarIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${urgency.cardLabel}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`;
	const clockIcon    = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${urgency.cardLabel}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px;"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;

	const meetingSummary = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${urgency.cardBg};border-radius:12px;margin-bottom:24px;">
  <tr>
    <td style="padding:20px 24px;">
      <div style="font-size:17px;font-weight:700;color:${urgency.cardValue};margin-bottom:16px;">${data.eventName}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:0 0 12px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:top;padding-right:12px;">${calendarIcon}</td>
              <td style="vertical-align:top;">
                <div style="color:${urgency.cardLabel};font-size:12px;margin-bottom:2px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Date</div>
                <div style="color:${urgency.cardValue};font-size:15px;font-weight:600;">${formatDate(data.startTime)}</div>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0"><tr>
              <td style="vertical-align:top;padding-right:12px;">${clockIcon}</td>
              <td style="vertical-align:top;">
                <div style="color:${urgency.cardLabel};font-size:12px;margin-bottom:2px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Time</div>
                <div style="color:${urgency.cardValue};font-size:15px;font-weight:600;">${formatTime(data.startTime)} – ${formatTime(data.endTime)}</div>
              </td>
            </tr></table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`.trim();

	const meetingLabel = data.meetingType === 'teams' ? 'Join Microsoft Teams Meeting' : 'Join Google Meet';
	const actionButton = data.meetingUrl
		? generateActionButton(data.meetingUrl, meetingLabel, brandColor)
		: '';

	const managementLinks = generateManagementLinks(rescheduleUrl, cancelUrl, brandColor);

	const bodyContent = `
<p style="margin:0 0 8px;color:${root['--color-muted-foreground']};font-size:16px;line-height:24px;">
  Hi <strong style="color:${root['--color-foreground']};">${data.attendeeName}</strong>,
</p>
<p style="margin:0 0 24px;color:${root['--color-muted-foreground']};font-size:15px;line-height:23px;">
  This is a friendly reminder that your meeting with <strong style="color:${root['--color-foreground']};">${data.hostName}</strong> is coming up <strong>${timeLabel}</strong>.
</p>

${customMessageSection}
${meetingSummary}
${actionButton}
${managementLinks}
	`.trim();

	return generateBaseEmail({
		title: 'Meeting Reminder',
		statusBadge: badgeReminder(urgency.badgeBg, urgency.badgeIcon),
		heading: `Meeting ${timeLabel}!`,
		bodyContent,
		footerContent: `This is an automated email from ${data.hostName}'s meeting scheduler.`
	});
}

/**
 * Get default reminder subjects
 */
export function getDefaultReminderSubject(data: BookingEmailData, reminderType: ReminderType): string {
	const subjects: Record<ReminderType, string> = {
		'reminder_24h': `Reminder: ${data.eventName} tomorrow with ${data.hostName}`,
		'reminder_1h': `Reminder: ${data.eventName} starts in 1 hour`,
		'reminder_30m': `Starting Soon: ${data.eventName} in 30 minutes`
	};
	return subjects[reminderType];
}
