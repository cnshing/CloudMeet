/**
 * Email Preview Generator
 *
 * Calls every email template function with sample data and writes the rendered
 * HTML to email-previews/ so you can open them directly in a browser.
 *
 * Usage:
 *   npx tsx scripts/generate-email-previews.ts
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateBookingEmail } from '../src/lib/server/email/templates/confirmation';
import {
	generateCancellationEmail,
	generateAdminCancellationEmail
} from '../src/lib/server/email/templates/cancellation';
import {
	generateRescheduleEmail,
	generateAdminRescheduleEmail
} from '../src/lib/server/email/templates/reschedule';
import { generateAdminNotificationEmail } from '../src/lib/server/email/templates/admin-notification';
import { generateReminderEmail } from '../src/lib/server/email/templates/reminder';
import { generateRescheduleProposalEmail } from '../src/lib/server/email/templates/reschedule-proposal';

import type {
	BookingEmailData,
	RescheduleEmailData,
	RescheduleProposalEmailData
} from '../src/lib/server/email/types';

// ---------------------------------------------------------------------------
// Sample dates
// ---------------------------------------------------------------------------

const START   = new Date('2026-07-14T10:00:00-07:00');
const END     = new Date('2026-07-14T10:30:00-07:00');
const OLD_START = new Date('2026-07-11T14:00:00-07:00');
const OLD_END   = new Date('2026-07-11T14:30:00-07:00');
const NEW_START = new Date('2026-07-16T11:00:00-07:00');
const NEW_END   = new Date('2026-07-16T11:30:00-07:00');

// ---------------------------------------------------------------------------
// Shared sample data
// ---------------------------------------------------------------------------

const booking: BookingEmailData = {
	attendeeName:    'Sarah Chen',
	attendeeEmail:   'sarah@example.com',
	eventName:       '30-Minute Consultation',
	eventSlug:       'consultation',
	eventDescription:'A quick chat to discuss your project needs.',
	startTime:       START,
	endTime:         END,
	meetingUrl:      'https://meet.google.com/abc-defg-hij',
	meetingType:     'google_meet',
	bookingId:       'bk_abc123',
	hostName:        'Alex Johnson',
	hostEmail:       'alex@example.com',
	hostContactEmail:'alex@example.com',
	appUrl:          'https://cloudmeet.example.com',
	timeFormat:      '12h',
	timezone:        'America/Los_Angeles',
	attendeeNotes:   'Looking forward to this! I have a few questions about the onboarding process.',
	customMessage:  `<p>Hi {attendee_name},</p>
<p>Thanks for booking time with <strong>{host_name}</strong> — really looking forward to it!</p>
<p><strong>{event_name}</strong><br>
{date}<br>
{time}</p>
<p>Join here: <a href="{meeting_url}">{meeting_url}</a></p>
<p>Need to make changes? <a href="{reschedule_url}">Reschedule</a> or <a href="{cancel_url}">Cancel</a>.</p>
<p>See you then!<br>{host_name}</p>`,
};

const reschedule: RescheduleEmailData = {
	...booking,
	startTime:    NEW_START,
	endTime:      NEW_END,
	oldStartTime: OLD_START,
	oldEndTime:   OLD_END,
	customMessage:`<p>Hi {attendee_name},</p>
<p>I had a conflict come up on Friday — the new time below should work better for both of us!</p>
<p><strong>Previous time:</strong><br>{previous_date}<br>{previous_time}</p>
<p><strong>New time:</strong><br>{date}<br>{time}</p>
<p>Join here: <a href="{meeting_url}">{meeting_url}</a></p>
<p><a href="{reschedule_url}">Reschedule again</a> or <a href="{cancel_url}">Cancel</a>.</p>`,
};

const proposal: RescheduleProposalEmailData = {
	attendeeName:  booking.attendeeName,
	attendeeEmail: booking.attendeeEmail,
	eventName:     booking.eventName,
	eventSlug:     booking.eventSlug!,
	hostName:      booking.hostName,
	hostEmail:     booking.hostEmail,
	oldStartTime:  OLD_START,
	oldEndTime:    OLD_END,
	newStartTime:  NEW_START,
	newEndTime:    NEW_END,
	message:       "Something came up — would Thursday at 11 AM work for you instead?",
	responseUrl:   'https://cloudmeet.example.com/reschedule-response/tok_xyz789',
	appUrl:        booking.appUrl,
	timeFormat:    '12h',
	brandColor:    '#86c322',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const OUT_DIR    = resolve(__dirname, '../email-previews');

mkdirSync(OUT_DIR, { recursive: true });

function write(filename: string, html: string): void {
	const path = resolve(OUT_DIR, filename);
	writeFileSync(path, html, 'utf8');
	console.log(`  ✓  ${filename}`);
}

console.log('\nGenerating email previews → email-previews/\n');

// 01 — Booking confirmation (attendee)
write('01-confirmation.html',
	generateBookingEmail(booking)
);

// 02 — New booking notification (host/admin)
write('02-admin-notification.html',
	generateAdminNotificationEmail(booking)
);

// 03 — Cancellation (attendee) — with custom message
write('03-cancellation.html',
	generateCancellationEmail({
		...booking,
		customMessage: `<p>Hi {attendee_name},</p>
<p>Unfortunately I need to cancel our meeting due to a scheduling conflict. Please feel free to rebook at a time that works for you.</p>
<p><strong>{event_name}</strong><br>Was scheduled for {date}<br>{time}</p>`,
	})
);

// 04 — Cancellation notification (host/admin)
write('04-admin-cancellation.html',
	generateAdminCancellationEmail({
		...booking,
		customMessage: 'Sarah had a scheduling conflict and needed to cancel.',
	})
);

// 05 — Reschedule confirmation (attendee)
write('05-reschedule.html',
	generateRescheduleEmail(reschedule)
);

// 06 — Reschedule notification (host/admin)
write('06-admin-reschedule.html',
	generateAdminRescheduleEmail(reschedule)
);

// 07 — 24h reminder
write('07-reminder-24h.html',
	generateReminderEmail({
		...booking,
		customMessage: `<p>Hi {attendee_name},</p>
<p>Just a reminder — your meeting with {host_name} is coming up {reminder_time}.</p>
<p><strong>{event_name}</strong><br>{date}<br>{time}</p>
<p>Join here: <a href="{meeting_url}">{meeting_url}</a></p>`,
	}, 'reminder_24h')
);

// 08 — 1h reminder
write('08-reminder-1h.html',
	generateReminderEmail({
		...booking,
		customMessage: `<p>Hi {attendee_name},</p>
<p>Just a reminder — your meeting with {host_name} is coming up {reminder_time}.</p>
<p><strong>{event_name}</strong><br>{date}<br>{time}</p>
<p>Join here: <a href="{meeting_url}">{meeting_url}</a></p>`,
	}, 'reminder_1h')
);

// 09 — 30min reminder
write('09-reminder-30m.html',
	generateReminderEmail(booking, 'reminder_30m')
);

// 10 — Host-initiated reschedule proposal (attendee action required)
write('10-reschedule-proposal.html',
	generateRescheduleProposalEmail(proposal)
);

console.log('\nDone. Open any file in email-previews/ in your browser.\n');
