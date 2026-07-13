/**
 * Email service - re-exports from modular email module
 *
 * This file maintains backward compatibility by re-exporting from the new
 * modular email structure in src/lib/server/email/
 */

export {
	// Types
	type BookingEmailData,
	type RescheduleEmailData,
	type RescheduleProposalEmailData,
	type EmailConfig,
	type EmailTemplate,
	type EmailTemplateType,
	type EmailAddress,
	type EmailMessage,
	type EmailProvider,
	type EmailProviderName,
	type EmailSendResult,
	type EmailVariableMap,
	// Provider config
	getEmailConfig,
	getEmailProviderFromEnv,
	isEmailConfigured,
	// Formatters
	createEmailFormatters,
	replaceSubjectVariables,
	// Variable substitution
	applyEmailVariables,
	buildBookingVariables,
	buildRescheduleVariables,
	buildReminderVariables,
	// Sanitization
	sanitizeEmailHtml,
	htmlToPlainText,
	// Template generators
	generateBookingEmail,
	generateBookingEmailText,
	generateCancellationEmail,
	generateCancellationEmailText,
	generateAdminCancellationEmail,
	generateRescheduleEmail,
	generateRescheduleEmailText,
	generateAdminRescheduleEmail,
	generateRescheduleProposalEmail,
	generateReminderEmail,
	generateReminderEmailText,
	getDefaultReminderSubject,
	generateAdminNotificationEmail,
	// Send functions
	sendBookingEmail,
	sendCancellationEmail,
	sendRescheduleEmail,
	sendRescheduleProposalEmail,
	sendReminderEmail,
	sendAdminNotificationEmail,
	sendAdminCancellationNotification,
	sendAdminRescheduleNotification,
	// Database functions
	getEmailTemplates,
	isEmailEnabled
} from './email/index';
