import type { EmailAddress, EmailMessage, EmailProvider } from './types';

const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_USER_AGENT = 'cloudmeet/1.0';

interface ResendSendEmailRequest {
	from: string;
	to: string | string[];
	subject: string;
	html?: string;
	text?: string;
	reply_to?: string;
}

interface ResendSendEmailResponse {
	id?: unknown;
}

function formatAddress(address: EmailAddress): string {
	if (!address.name) {
		return address.email;
	}

	const escapedName = address.name.replace(/"/g, '\\"');
	return `"${escapedName}" <${address.email}>`;
}

function formatRecipients(recipients: EmailMessage['to']): string | string[] {
	return Array.isArray(recipients)
		? recipients.map(formatAddress)
		: formatAddress(recipients);
}

export interface ResendProviderConfig {
	apiKey: string;
}

/**
 * Resend provider adapter.
 *
 * This wrapper keeps Resend-specific API details isolated from the rest of the
 * email module and translates CloudMeet's normalized message shape into the
 * Resend Email API payload.
 */
export function createResendProvider(config: ResendProviderConfig): EmailProvider {
	return {
		name: 'resend',

		async send(message: EmailMessage) {
			const payload: ResendSendEmailRequest = {
				from: formatAddress(message.from),
				to: formatRecipients(message.to),
				subject: message.subject,
				text: message.text,
				html: message.html,
				...(message.replyTo ? { reply_to: formatAddress(message.replyTo) } : {})
			};

			const response = await fetch(RESEND_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${config.apiKey}`,
					'User-Agent': RESEND_USER_AGENT
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Resend send failed: ${error}`);
			}

			let raw: unknown;
			try {
				raw = await response.json();
			} catch {
				// Resend normally returns JSON, but a 2xx response still means success.
			}

			const messageId =
				raw && typeof raw === 'object'
					? String((raw as ResendSendEmailResponse).id ?? '') || undefined
					: undefined;

			return {
				provider: 'resend',
				messageId,
				raw
			};
		}
	};
}