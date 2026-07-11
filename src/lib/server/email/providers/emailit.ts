import type { EmailAddress, EmailMessage, EmailProvider } from './types';

const EMAILIT_API_URL = 'https://api.emailit.com/v2/emails';

interface EmailitSendEmailRequest {
	from: string;
	to: string | string[];
	subject: string;
	html?: string;
	text?: string;
	reply_to?: string;
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

export interface EmailitProviderConfig {
	apiKey: string;
}

/**
 * Emailit provider adapter.
 *
 * This is the only place that should know about Emailit's API URL, auth header,
 * and snake_case payload fields.
 */
export function createEmailitProvider(config: EmailitProviderConfig): EmailProvider {
	return {
		name: 'emailit',

		async send(message: EmailMessage) {
			const payload: EmailitSendEmailRequest = {
				from: formatAddress(message.from),
				to: formatRecipients(message.to),
				subject: message.subject,
				text: message.text,
				html: message.html,
				...(message.replyTo ? { reply_to: formatAddress(message.replyTo) } : {})
			};

			const response = await fetch(EMAILIT_API_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${config.apiKey}`
				},
				body: JSON.stringify(payload)
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`Emailit send failed: ${error}`);
			}

			let raw: unknown;
			try {
				raw = await response.json();
			} catch {
				// Emailit may return an empty response body. That's still a success.
			}

			const messageId =
				raw && typeof raw === 'object'
					? String((raw as { id?: unknown; message_id?: unknown }).id ?? (raw as { message_id?: unknown }).message_id ?? '') || undefined
					: undefined;

			return {
				provider: 'emailit',
				messageId,
				raw
			};
		}
	};
}