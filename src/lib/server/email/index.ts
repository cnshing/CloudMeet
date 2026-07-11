/**
 * Email service facade.
 *
 * This is the main entry point for the email module.
 * It re-exports types, formatters, templates, provider helpers, and provides
 * domain-specific send functions.
 */

// Re-export types
export type {
	BookingEmailData,
	RescheduleEmailData,
	RescheduleProposalEmailData,
	EmailConfig,
	EmailTemplate,
	EmailTemplateType
} from './types';

// Re-export provider contracts and config helpers
export type {
	EmailAddress,
	EmailMessage,
	EmailProvider,
	EmailProviderName,
	EmailSendResult
} from './providers';
export { getEmailConfig, getEmailProviderFromEnv, isEmailConfigured } from './config';

// Re-export formatters
export { createEmailFormatters, replaceSubjectVariables } from './formatters';

// Re-export template generators
export {
	generateBookingEmail,
	generateBookingEmailText,
	generateCancellationEmail,
	generateAdminCancellationEmail,
	generateRescheduleEmail,
	generateAdminRescheduleEmail,
	generateRescheduleProposalEmail,
	generateReminderEmail,
	getDefaultReminderSubject,
	generateAdminNotificationEmail
} from './templates';

import type {
	BookingEmailData,
	RescheduleEmailData,
	RescheduleProposalEmailData,
	EmailConfig,
	EmailTemplate,
	EmailTemplateType
} from './types';
import type { EmailAddress, EmailMessage } from './providers';
import { replaceSubjectVariables } from './formatters';
import {
	generateBookingEmail,
	generateBookingEmailText,
	generateCancellationEmail,
	generateAdminCancellationEmail,
	generateRescheduleEmail,
	generateAdminRescheduleEmail,
	generateRescheduleProposalEmail,
	generateReminderEmail,
	getDefaultReminderSubject,
	generateAdminNotificationEmail
} from './templates';

function emailAddress(email: string, name?: string): EmailAddress {
	return name ? { email, name } : { email };
}

async function sendWithProvider(
	config: EmailConfig,
	message: EmailMessage,
	errorContext: string
): Promise<void> {
	try {
		await config.provider.send(message);
	} catch (error) {
		console.error(`${errorContext}:`, error);
		throw error;
	}
}

/**
 * Send booking confirmation email.
 */
export async function sendBookingEmail(
	data: BookingEmailData,
	config: EmailConfig,
	customSubject?: string
): Promise<void> {
	const htmlBody = generateBookingEmail(data);
	const textBody = generateBookingEmailText(data);
	const subject = customSubject
		? replaceSubjectVariables(customSubject, data)
		: `Meeting Confirmed: ${data.eventName} with ${data.hostName}`;

	await sendWithProvider(
		config,
		{
			from: emailAddress(config.from, data.hostName),
			to: emailAddress(data.attendeeEmail, data.attendeeName),
			replyTo: config.replyTo ? emailAddress(config.replyTo) : undefined,
			subject,
			text: textBody,
			html: htmlBody
		},
		'Email sending error'
	);
}

/**
 * Send cancellation email
 */
export async function sendCancellationEmail(
	data: BookingEmailData,
	config: EmailConfig,
	customSubject?: string
): Promise<void> {
	const htmlBody = generateCancellationEmail(data);
	const subject = customSubject
		? replaceSubjectVariables(customSubject, data)
		: `Meeting Cancelled: ${data.eventName}`;

	await sendWithProvider(
		config,
		{
			from: emailAddress(config.from, data.hostName),
			to: emailAddress(data.attendeeEmail, data.attendeeName),
			replyTo: config.replyTo ? emailAddress(config.replyTo) : undefined,
			subject,
			html: htmlBody
		},
		'Cancellation email error'
	);
}

/**
 * Send reschedule email
 */
export async function sendRescheduleEmail(
	data: RescheduleEmailData,
	config: EmailConfig,
	customSubject?: string
): Promise<void> {
	const htmlBody = generateRescheduleEmail(data);
	const subject = customSubject
		? replaceSubjectVariables(customSubject, data)
		: `Meeting Rescheduled: ${data.eventName} with ${data.hostName}`;

	await sendWithProvider(
		config,
		{
			from: emailAddress(config.from, data.hostName),
			to: emailAddress(data.attendeeEmail, data.attendeeName),
			replyTo: config.replyTo ? emailAddress(config.replyTo) : undefined,
			subject,
			html: htmlBody
		},
		'Reschedule email error'
	);
}

/**
 * Send reminder email
 */
export async function sendReminderEmail(
	data: BookingEmailData,
	reminderType: 'reminder_24h' | 'reminder_1h' | 'reminder_30m',
	config: EmailConfig,
	customSubject?: string
): Promise<void> {
	const htmlBody = generateReminderEmail(data, reminderType);
	const subject = customSubject
		? replaceSubjectVariables(customSubject, data)
		: getDefaultReminderSubject(data, reminderType);

	await sendWithProvider(
		config,
		{
			from: emailAddress(config.from, data.hostName),
			to: emailAddress(data.attendeeEmail, data.attendeeName),
			replyTo: config.replyTo ? emailAddress(config.replyTo) : undefined,
			subject,
			html: htmlBody
		},
		'Reminder email error'
	);
}

/**
 * Send admin notification email when a booking is made
 */
export async function sendAdminNotificationEmail(
	data: BookingEmailData,
	adminEmail: string,
	config: EmailConfig
): Promise<void> {
	const htmlBody = generateAdminNotificationEmail(data);

	await sendWithProvider(
		config,
		{
			from: emailAddress(config.from, 'CloudMeet'),
			to: emailAddress(adminEmail),
			subject: `New Booking: ${data.eventName} with ${data.attendeeName}`,
			html: htmlBody
		},
		'Admin notification email error'
	);
}

/**
 * Send admin notification for cancellation
 */
export async function sendAdminCancellationNotification(
	data: BookingEmailData,
	adminEmail: string,
	config: EmailConfig
): Promise<void> {
	const htmlBody = generateAdminCancellationEmail(data);

	await sendWithProvider(
		config,
		{
			from: emailAddress(config.from, 'CloudMeet'),
			to: emailAddress(adminEmail),
			subject: `Booking Cancelled: ${data.eventName} with ${data.attendeeName}`,
			html: htmlBody
		},
		'Admin cancellation notification error'
	);
}

/**
 * Send admin notification for reschedule
 */
export async function sendAdminRescheduleNotification(
	data: RescheduleEmailData,
	adminEmail: string,
	config: EmailConfig
): Promise<void> {
	const htmlBody = generateAdminRescheduleEmail(data);

	await sendWithProvider(
		config,
		{
			from: emailAddress(config.from, 'CloudMeet'),
			to: emailAddress(adminEmail),
			subject: `Booking Rescheduled: ${data.eventName} with ${data.attendeeName}`,
			html: htmlBody
		},
		'Admin reschedule notification error'
	);
}

/**
 * Send host-initiated reschedule proposal email.
 */
export async function sendRescheduleProposalEmail(
	data: RescheduleProposalEmailData,
	config: EmailConfig
): Promise<void> {
	const htmlBody = generateRescheduleProposalEmail(data);

	await sendWithProvider(
		config,
		{
			from: emailAddress(config.from, data.hostName),
			to: emailAddress(data.attendeeEmail, data.attendeeName),
			replyTo: config.replyTo ? emailAddress(config.replyTo) : undefined,
			subject: `Reschedule Request: ${data.eventName} with ${data.hostName}`,
			html: htmlBody
		},
		'Reschedule proposal email error'
	);
}

/**
 * Get email templates for a user
 */
export async function getEmailTemplates(
	db: D1Database,
	userId: string
): Promise<Map<EmailTemplateType, EmailTemplate>> {
	const templates = await db
		.prepare(
			'SELECT template_type, is_enabled, subject, custom_message FROM email_templates WHERE user_id = ?'
		)
		.bind(userId)
		.all<{
			template_type: EmailTemplateType;
			is_enabled: number;
			subject: string | null;
			custom_message: string | null;
		}>();

	const map = new Map<EmailTemplateType, EmailTemplate>();
	for (const t of templates.results) {
		map.set(t.template_type, {
			template_type: t.template_type,
			is_enabled: t.is_enabled === 1,
			subject: t.subject,
			custom_message: t.custom_message
		});
	}
	return map;
}

/**
 * Check if a specific email type is enabled
 */
export function isEmailEnabled(
	templates: Map<EmailTemplateType, EmailTemplate>,
	type: EmailTemplateType
): boolean {
	const template = templates.get(type);
	// Default to enabled if no template exists
	return template ? template.is_enabled : true;
}
