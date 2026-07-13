/**
 * Email service types
 */

import type { EmailProvider } from './providers';

export interface BookingEmailData {
	attendeeName: string;
	attendeeEmail: string;
	eventName: string;
	eventSlug?: string;
	eventDescription: string;
	startTime: Date;
	endTime: Date;
	meetingUrl: string | null;
	meetingType?: 'google_meet' | 'teams';
	bookingId: string | number;
	hostName: string;
	hostEmail: string;
	hostContactEmail?: string;
	appUrl: string;
	customMessage?: string | null;
	timeFormat?: '12h' | '24h';
	timezone?: string;
	brandColor?: string;
	attendeeNotes?: string | null;
	/**
	 * One-off cancellation reason typed by the host at cancel time (distinct
	 * from `customMessage`, which is the host's saved dashboard template body).
	 * Exposed to templates via the {cancellation_reason} variable.
	 */
	cancellationReason?: string | null;
}


export interface RescheduleEmailData extends BookingEmailData {
	oldStartTime: Date;
	oldEndTime: Date;
}

export interface RescheduleProposalEmailData {
	attendeeName: string;
	attendeeEmail: string;
	eventName: string;
	eventSlug: string;
	hostName: string;
	hostEmail: string;
	oldStartTime: Date;
	oldEndTime: Date;
	newStartTime: Date;
	newEndTime: Date;
	message: string | null;
	responseUrl: string;
	appUrl: string;
	timeFormat: '12h' | '24h';
	brandColor: string;
}

export type EmailTemplateType = 'confirmation' | 'cancellation' | 'reschedule' | 'reminder_24h' | 'reminder_1h' | 'reminder_30m';

export interface EmailTemplate {
	template_type: EmailTemplateType;
	is_enabled: boolean;
	subject: string | null;
	custom_message: string | null;
}

export interface EmailConfig {
	provider: EmailProvider;
	from: string;
	replyTo?: string;
}
