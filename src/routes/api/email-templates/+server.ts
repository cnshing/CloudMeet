/**
 * Email Templates API endpoint
 * Manages email template settings (enable/disable, custom subjects, rich-text bodies)
 */

import { json, error, type RequestEvent } from '@sveltejs/kit';
import { getCurrentUser } from '$lib/server/auth';
import { sanitizeEmailHtml } from '$lib/server/email/sanitize';
import { validateLength, validateFields, MAX_LENGTHS } from '$lib/server/validation';

export interface EmailTemplate {
	id: string;
	template_type: string;
	is_enabled: number;
	subject: string | null;
	custom_message: string | null;
}

// Default templates with descriptions.
// `default_message` mirrors each template file's DEFAULT_*_BODY constant so
// the dashboard can show/preview what will be sent if the host hasn't
// customized the body yet.
const DEFAULT_TEMPLATES = [
	{
		template_type: 'confirmation',
		name: 'Booking Confirmation',
		description: 'Sent when someone books a meeting with you',
		default_subject: 'Meeting Confirmed: {event_name} with {host_name}',
		default_message: `<p>Hi {attendee_name},</p>
<p>Your meeting with {host_name} has been confirmed. A calendar invitation has been sent to your email address.</p>
<p><strong>{event_name}</strong><br>
{date}<br>
{time}</p>
<p>Join meeting: <a href="{meeting_url}">{meeting_url}</a></p>
<p>Need to make changes? <a href="{reschedule_url}">Reschedule</a> or <a href="{cancel_url}">Cancel</a>.</p>`
	},
	{
		template_type: 'cancellation',
		name: 'Cancellation Notice',
		description: 'Sent when a meeting is cancelled',
		default_subject: 'Meeting Cancelled: {event_name}',
		default_message: `<p>Hi {attendee_name},</p>
<p>Your meeting with {host_name} has been cancelled.</p>
<p>{cancellation_reason}</p>
<p><strong>{event_name}</strong><br>
Was scheduled for {date}<br>
{time}</p>
<p>Want to schedule again? Use the link below to book another time.</p>`
	},

	{
		template_type: 'reschedule',
		name: 'Reschedule Confirmation',
		description: 'Sent when a meeting is rescheduled',
		default_subject: 'Meeting Rescheduled: {event_name} with {host_name}',
		default_message: `<p>Hi {attendee_name},</p>
<p>Your meeting with {host_name} has been moved to a new time. Your calendar invitation has been updated.</p>
<p><strong>Previous time:</strong><br>
{previous_date}<br>
{previous_time}</p>
<p><strong>New time:</strong><br>
{date}<br>
{time}</p>
<p>Join meeting: <a href="{meeting_url}">{meeting_url}</a></p>
<p>Need to make changes? <a href="{reschedule_url}">Reschedule again</a> or <a href="{cancel_url}">Cancel</a>.</p>`
	},
	{
		template_type: 'reminder_24h',
		name: '24 Hour Reminder',
		description: 'Sent 24 hours before the meeting',
		default_subject: 'Reminder: {event_name} tomorrow with {host_name}',
		default_message: `<p>Hi {attendee_name},</p>
<p>This is a friendly reminder that your meeting with {host_name} is coming up {reminder_time}.</p>
<p><strong>{event_name}</strong><br>
{date}<br>
{time}</p>
<p>Join meeting: <a href="{meeting_url}">{meeting_url}</a></p>
<p>Need to make changes? <a href="{reschedule_url}">Reschedule</a> or <a href="{cancel_url}">Cancel</a>.</p>`
	},
	{
		template_type: 'reminder_1h',
		name: '1 Hour Reminder',
		description: 'Sent 1 hour before the meeting',
		default_subject: 'Reminder: {event_name} starts in 1 hour',
		default_message: `<p>Hi {attendee_name},</p>
<p>This is a friendly reminder that your meeting with {host_name} is coming up {reminder_time}.</p>
<p><strong>{event_name}</strong><br>
{date}<br>
{time}</p>
<p>Join meeting: <a href="{meeting_url}">{meeting_url}</a></p>
<p>Need to make changes? <a href="{reschedule_url}">Reschedule</a> or <a href="{cancel_url}">Cancel</a>.</p>`
	}
];

export const GET = async (event: RequestEvent) => {
	const userId = await getCurrentUser(event);
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const env = event.platform?.env;
	if (!env) {
		throw error(500, 'Platform env not available');
	}

	const db = env.DB;

	try {
		// Get user's email templates
		const templates = await db
			.prepare('SELECT id, template_type, is_enabled, subject, custom_message FROM email_templates WHERE user_id = ?')
			.bind(userId)
			.all<EmailTemplate>();

		// Merge with defaults (templates that don't exist in DB yet)
		const templateMap = new Map(templates.results.map(t => [t.template_type, t]));

		const result = DEFAULT_TEMPLATES.map(def => {
			const saved = templateMap.get(def.template_type);
			return {
				...def,
				id: saved?.id || null,
				is_enabled: saved ? saved.is_enabled === 1 : true,
				subject: saved?.subject || def.default_subject,
				custom_message: saved?.custom_message || def.default_message
			};
		});

		return json({ templates: result });
	} catch (err: any) {
		console.error('Email templates GET error:', err);
		throw error(500, 'Failed to fetch email templates');
	}
};

export const PUT = async (event: RequestEvent) => {
	const userId = await getCurrentUser(event);
	if (!userId) {
		throw error(401, 'Unauthorized');
	}

	const env = event.platform?.env;
	if (!env) {
		throw error(500, 'Platform env not available');
	}

	const db = env.DB;

	try {
		const body = await event.request.json() as {
			template_type: string;
			is_enabled: boolean;
			subject?: string | null;
			custom_message?: string | null;
		};
		const { template_type, is_enabled, subject, custom_message } = body;

		// Validate template type
		const validTypes = DEFAULT_TEMPLATES.map(t => t.template_type);
		if (!validTypes.includes(template_type)) {
			throw error(400, 'Invalid template type');
		}

		// Validate input lengths
		const lengthError = validateFields([
			validateLength(subject, 'Subject', MAX_LENGTHS.emailSubject, false),
			validateLength(custom_message, 'Email body', MAX_LENGTHS.emailBody, false)
		]);
		if (lengthError) {
			throw error(400, lengthError);
		}

		// Sanitize the rich-text body before storing (strip to the allowlisted
		// tag set understood by the email templates / WYSIWYG editor).
		const sanitizedMessage = custom_message
			? sanitizeEmailHtml(custom_message)
			: null;

		// Upsert template
		await db
			.prepare(`
				INSERT INTO email_templates (user_id, template_type, is_enabled, subject, custom_message, updated_at)
				VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
				ON CONFLICT(user_id, template_type)
				DO UPDATE SET is_enabled = excluded.is_enabled, subject = excluded.subject, custom_message = excluded.custom_message, updated_at = CURRENT_TIMESTAMP
			`)
			.bind(userId, template_type, is_enabled ? 1 : 0, subject || null, sanitizedMessage)
			.run();

		return json({ success: true });
	} catch (err: any) {
		console.error('Email templates PUT error:', err);
		if (err?.status) throw err;
		throw error(500, 'Failed to update email template');
	}
};
