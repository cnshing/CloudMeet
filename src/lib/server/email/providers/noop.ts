import type { EmailMessage, EmailProvider } from './types';

/**
 * No-op provider for local development, testing, or disabled delivery.
 */
export function createNoopProvider(): EmailProvider {
	return {
		name: 'noop',

		async send(message: EmailMessage) {
			const recipients = Array.isArray(message.to)
				? message.to.map((recipient) => recipient.email).join(', ')
				: message.to.email;

			console.info(`[email:noop] Skipped sending "${message.subject}" to ${recipients}`);

			return {
				provider: 'noop'
			};
		}
	};
}