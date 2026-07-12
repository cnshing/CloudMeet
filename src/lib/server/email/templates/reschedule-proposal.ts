/**
 * Reschedule proposal email template
 */

import { root } from '../../../../app.css';
import type { RescheduleProposalEmailData } from '../types';
import {
	generateBaseEmail,
	generateTimeComparison,
	badgeProposal
} from './base';

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

	const brandColor = data.brandColor || root['--color-primary'];

	const messageSection = data.message ? `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${root['--color-surface-2']};border-radius:8px;border-left:3px solid ${root['--color-accent']};margin-bottom:24px;">
  <tr>
    <td style="padding:16px 20px;">
      <div style="color:${root['--color-border-strong']};font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px;">Message from ${data.hostName}</div>
      <div style="color:${root['--color-foreground']};font-size:14px;line-height:21px;">${data.message}</div>
    </td>
  </tr>
</table>` : '';

	const timeComparison = generateTimeComparison(
		'Original time',
		`${formatDate(data.oldStartTime)}\n${formatTime(data.oldStartTime)} – ${formatTime(data.oldEndTime)}`,
		'Proposed time',
		`${formatDate(data.newStartTime)}\n${formatTime(data.newStartTime)} – ${formatTime(data.newEndTime)}`
	);

	// Accept / Decline pill buttons
	const actionButtons = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
  <tr>
    <td align="center">
      <a href="${data.responseUrl}?action=accept" style="display:inline-block;padding:14px 28px;background-color:${root['--color-primary']};color:${root['--color-primary-foreground']};text-decoration:none;border-radius:9999px;font-weight:700;font-size:15px;margin:0 6px;">Accept New Time</a>
      <a href="${data.responseUrl}?action=decline" style="display:inline-block;padding:14px 28px;background-color:#dc2626;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:700;font-size:15px;margin:0 6px;">Decline</a>
    </td>
  </tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
  <tr>
    <td align="center">
      <a href="${data.responseUrl}?action=counter" style="color:${brandColor};text-decoration:none;font-size:13px;font-weight:500;">Propose a different time</a>
    </td>
  </tr>
</table>`;

	const bodyContent = `
<p style="margin:0 0 8px;color:${root['--color-muted-foreground']};font-size:16px;line-height:24px;">
  Hi <strong style="color:${root['--color-foreground']};">${data.attendeeName}</strong>,
</p>
<p style="margin:0 0 24px;color:${root['--color-muted-foreground']};font-size:15px;line-height:23px;">
  <strong style="color:${root['--color-foreground']};">${data.hostName}</strong> would like to reschedule your meeting to a new time.
</p>

${messageSection}
${timeComparison}
${actionButtons}
	`.trim();

	return generateBaseEmail({
		title: 'Reschedule Request',
		statusBadge: badgeProposal(),
		heading: 'Reschedule Request',
		bodyContent,
		footerContent: `This reschedule request was sent by ${data.hostName}.`
	});
}
