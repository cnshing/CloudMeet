import type { EmailConfig } from './types';
import { createEmailitProvider, createNoopProvider, createResendProvider } from './providers';
import type { EmailProvider, EmailProviderName } from './providers';

export interface EmailConfigOptions {
	from: string;
	replyTo?: string | null;
}

/**
 * Resolve the configured provider from runtime env.
 *
 * Defaults to Emailit for backward compatibility with existing deployments.
 */
export function getEmailProviderFromEnv(env: App.Platform['env']): EmailProvider | null {
	const providerName = (env.EMAIL_PROVIDER || 'emailit') as EmailProviderName;

	switch (providerName) {
		case 'emailit':
			return env.EMAILIT_API_KEY
				? createEmailitProvider({ apiKey: env.EMAILIT_API_KEY })
				: null;

		case 'resend':
			return env.RESEND_API_KEY
				? createResendProvider({ apiKey: env.RESEND_API_KEY })
				: null;

		case 'noop':
			return createNoopProvider();

		default:
			throw new Error(`Unsupported email provider: ${providerName}`);
	}
}

export function getEmailConfig(
	env: App.Platform['env'],
	options: EmailConfigOptions
): EmailConfig | null {
	const provider = getEmailProviderFromEnv(env);

	if (!provider) {
		return null;
	}

	return {
		provider,
		from: options.from,
		replyTo: options.replyTo || undefined
	};
}

export function isEmailConfigured(env: App.Platform['env']): boolean {
	return getEmailProviderFromEnv(env) !== null;
}