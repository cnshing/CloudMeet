/**
 * Provider-agnostic email delivery contracts.
 *
 * Every email provider wrapper should accept this normalized message shape and
 * translate it into the provider-specific API payload internally.
 */

export type EmailProviderName = 'emailit' | 'resend' | 'noop';

export interface EmailAddress {
	email: string;
	name?: string;
}

export interface EmailMessage {
	from: EmailAddress;
	to: EmailAddress | EmailAddress[];
	replyTo?: EmailAddress;
	subject: string;
	html?: string;
	text?: string;
}

export interface EmailSendResult {
	provider: EmailProviderName;
	messageId?: string;
	raw?: unknown;
}

export interface EmailProvider {
	readonly name: EmailProviderName;
	send(message: EmailMessage): Promise<EmailSendResult>;
}