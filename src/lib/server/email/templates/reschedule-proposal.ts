/**
 * Reschedule proposal email template
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

	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Reschedule Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6;">
	<table role="presentation" style="width: 100%; border-collapse: collapse;">
		<tr>
			<td align="center" style="padding: 40px 20px;">
				<table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
					<!-- Header -->
					<tr>
						<td style="padding: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align: center;">
							<h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Reschedule Request</h1>
						</td>
					</tr>

					<!-- Body -->
					<tr>
						<td style="padding: 40px;">
							<p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 24px;">
								Hi <strong>${data.attendeeName}</strong>,
							</p>
							<p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 24px;">
								<strong>${data.hostName}</strong> would like to reschedule your meeting.
							</p>

							${data.message ? `
							<div style="margin: 0 0 30px; padding: 16px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #f59e0b;">
								<p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 22px;">${data.message}</p>
							</div>
							` : ''}

							<!-- Time comparison -->
							<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
								<tr>
									<td style="width: 48%; vertical-align: top;">
										<div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; border: 1px solid #fecaca;">
											<div style="color: #991b1b; font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Original Time</div>
											<div style="color: #111827; font-size: 15px; font-weight: 500; text-decoration: line-through;">${formatDate(data.oldStartTime)}</div>
											<div style="color: #6b7280; font-size: 14px; text-decoration: line-through;">${formatTime(data.oldStartTime)} - ${formatTime(data.oldEndTime)}</div>
										</div>
									</td>
									<td style="width: 4%; text-align: center; vertical-align: middle;">
										<span style="color: #9c9d9b; font-size: 20px;">→</span>
									</td>
									<td style="width: 48%; vertical-align: top;">
										<div style="background-color: #f0fdf4; border-radius: 8px; padding: 16px; border: 1px solid #bbf7d0;">
											<div style="color: #166534; font-size: 12px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase;">Proposed Time</div>
											<div style="color: #111827; font-size: 15px; font-weight: 500;">${formatDate(data.newStartTime)}</div>
											<div style="color: #6b7280; font-size: 14px;">${formatTime(data.newStartTime)} - ${formatTime(data.newEndTime)}</div>
										</div>
									</td>
								</tr>
							</table>

							<!-- Action buttons -->
							<table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
								<tr>
									<td align="center">
										<a href="${data.responseUrl}?action=accept" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 0 8px;">Accept New Time</a>
										<a href="${data.responseUrl}?action=decline" style="display: inline-block; padding: 14px 28px; background-color: #ef4444; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; margin: 0 8px;">Decline</a>
									</td>
								</tr>
							</table>

							<p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 20px; text-align: center;">
								Or <a href="${data.responseUrl}?action=counter" style="color: ${data.brandColor}; text-decoration: none;">propose a different time</a>
							</p>
						</td>
					</tr>

					<!-- Footer -->
					<tr>
						<td style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
							<p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 18px; text-align: center;">
								This reschedule request was sent by ${data.hostName}.<br>
								Powered by <a href="https://github.com/dennisklappe/CloudMeet" style="color: #6b7280; text-decoration: none;">CloudMeet</a>
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
	`;
}