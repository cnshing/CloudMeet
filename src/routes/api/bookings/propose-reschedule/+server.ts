/**
 * Host-initiated reschedule proposal API endpoint
 * Creates a reschedule proposal and sends email to attendee
 */

import { json, error, type RequestEvent } from '@sveltejs/kit';
import { getCurrentUser } from '$lib/server/auth';
import { getEmailConfig, sendRescheduleProposalEmail, getEmailTemplates, isEmailEnabled } from '$lib/server/email';

export const POST = async (event: RequestEvent) => {
	const env = event.platform?.env;
	if (!env) {
		throw error(500, 'Platform env not available');
	}

	const db = env.DB;

	// Get current user
	const userId = await getCurrentUser(event);
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	try {
		const body = await event.request.json() as {
			bookingId: string;
			proposedStartTime: string;
			proposedEndTime: string;
			message?: string | null;
		};

		const { bookingId, proposedStartTime, proposedEndTime, message } = body;

		if (!bookingId || !proposedStartTime || !proposedEndTime) {
			throw error(400, 'Booking ID and proposed times are required');
		}

		// Get booking and verify ownership
		const booking = await db
			.prepare(
				`SELECT b.id, b.user_id, b.status, b.start_time, b.end_time,
				b.attendee_name, b.attendee_email, b.attendee_notes,
				e.name as event_name, e.slug as event_slug,
				u.name as host_name, u.email as host_email, u.contact_email, u.settings, u.brand_color
				FROM bookings b
				JOIN event_types e ON b.event_type_id = e.id
				JOIN users u ON b.user_id = u.id
				WHERE b.id = ?`
			)
			.bind(bookingId)
			.first<{
				id: string;
				user_id: string;
				status: string;
				start_time: string;
				end_time: string;
				attendee_name: string;
				attendee_email: string;
				attendee_notes: string | null;
				event_name: string;
				event_slug: string;
				host_name: string;
				host_email: string;
				contact_email: string | null;
				settings: string | null;
				brand_color: string | null;
			}>();

		if (!booking) {
			throw error(404, 'Booking not found');
		}

		if (booking.user_id !== userId) {
			throw error(403, 'You do not have permission to reschedule this booking');
		}

		if (booking.status !== 'confirmed') {
			throw error(400, 'Only confirmed bookings can be rescheduled');
		}

		// Generate a unique response token
		const responseToken = crypto.randomUUID();

		// Create reschedule proposal
		await db
			.prepare(
				`INSERT INTO reschedule_proposals
				(booking_id, proposed_start_time, proposed_end_time, message, proposed_by, response_token, expires_at)
				VALUES (?, ?, ?, ?, 'host', ?, datetime('now', '+7 days'))`
			)
			.bind(bookingId, proposedStartTime, proposedEndTime, message || null, responseToken)
			.run();

		// Mark original booking as having a pending proposal
		await db
			.prepare(`UPDATE bookings SET status = 'rescheduled' WHERE id = ?`)
			.bind(bookingId)
			.run();

		// Send email to attendee with proposal via configured provider
		const emailConfig = getEmailConfig(env, {
			from: env.EMAIL_FROM || booking.host_email,
			replyTo: booking.contact_email || booking.host_email
		});
		if (emailConfig) {
			try {
				// Parse user settings for time format
				let timeFormat: '12h' | '24h' = '12h';
				try {
					const settings = booking.settings ? JSON.parse(booking.settings) : {};
					timeFormat = settings.timeFormat === '24h' ? '24h' : '12h';
				} catch {
					// Keep default
				}

				const appUrl = env.APP_URL || '';
				const responseUrl = `${appUrl}/reschedule-response/${responseToken}`;

				// Load user's email template settings for the proposal type
				const emailTemplates = await getEmailTemplates(db, userId);
				const proposalTemplate = emailTemplates.get('reschedule_proposal');

				// Only send if the template is enabled (defaults to enabled if not configured)
				if (isEmailEnabled(emailTemplates, 'reschedule_proposal')) {
					await sendRescheduleProposalEmail(
						{
							attendeeName: booking.attendee_name,
							attendeeEmail: booking.attendee_email,
							eventName: booking.event_name,
							eventSlug: booking.event_slug,
							hostName: booking.host_name,
							hostEmail: booking.host_email,
							oldStartTime: new Date(booking.start_time),
							oldEndTime: new Date(booking.end_time),
							newStartTime: new Date(proposedStartTime),
							newEndTime: new Date(proposedEndTime),
							message: message || null,
							responseUrl,
							appUrl,
							timeFormat,
							brandColor: booking.brand_color || '#3b82f6'
						},
						emailConfig,
						proposalTemplate?.subject ?? null,
						proposalTemplate?.custom_message ?? null
					);
				}
			} catch (emailErr) {
				console.error('Failed to send reschedule proposal email:', emailErr);
				// Don't fail the request if email fails
			}
		}

		return json({ success: true, responseToken });
	} catch (err: any) {
		console.error('Propose reschedule error:', err);
		if (err?.status) throw err;
		throw error(500, 'Failed to create reschedule proposal');
	}
};
