/**
 * Scheduling limits helper
 * Shared logic for enforcing per-event-type "minimum scheduling notice" and
 * "booking window / max advance booking" rules.
 *
 * Used by:
 * - /api/availability and /api/availability/month (slot generation, with host bypass)
 * - /api/bookings and /api/bookings/reschedule (server-side re-validation, no bypass)
 */

export interface SchedulingLimits {
	minNoticeEnabled: boolean;
	minNoticeMinutes: number;
	bookingWindowEnabled: boolean;
	bookingWindowDays: number;
}

/** Raw shape as stored/queried from the event_types table. */
export interface EventTypeSchedulingRow {
	min_notice_enabled: number | boolean | null;
	min_notice_minutes: number | null;
	booking_window_enabled: number | boolean | null;
	booking_window_days: number | null;
}

/**
 * Normalize the raw DB row (booleans stored as 0/1, nullable numbers) into a
 * strongly-typed SchedulingLimits object with safe fallback defaults.
 */
export function getSchedulingLimits(row: EventTypeSchedulingRow): SchedulingLimits {
	return {
		minNoticeEnabled: !!row.min_notice_enabled,
		minNoticeMinutes: typeof row.min_notice_minutes === 'number' && row.min_notice_minutes > 0
			? row.min_notice_minutes
			: 4320,
		bookingWindowEnabled: !!row.booking_window_enabled,
		bookingWindowDays: typeof row.booking_window_days === 'number' && row.booking_window_days > 0
			? row.booking_window_days
			: 30
	};
}

/**
 * Check whether a candidate slot start time satisfies the configured
 * scheduling limits. Both rules are independently enabled/disabled.
 */
export function isWithinSchedulingLimits(
	slotStart: Date,
	limits: SchedulingLimits,
	now: Date = new Date()
): boolean {
	if (limits.minNoticeEnabled) {
		const earliestAllowed = new Date(now.getTime() + limits.minNoticeMinutes * 60 * 1000);
		if (slotStart < earliestAllowed) {
			return false;
		}
	}

	if (limits.bookingWindowEnabled) {
		const latestAllowed = new Date(now.getTime() + limits.bookingWindowDays * 24 * 60 * 60 * 1000);
		if (slotStart > latestAllowed) {
			return false;
		}
	}

	return true;
}

/**
 * Convenience helper for callers (e.g. the month endpoint) that want to
 * quickly skip whole days outside the booking window without checking every
 * slot. Returns null if the booking window rule is disabled (no cutoff).
 */
export function getBookingWindowCutoff(limits: SchedulingLimits, now: Date = new Date()): Date | null {
	if (!limits.bookingWindowEnabled) return null;
	return new Date(now.getTime() + limits.bookingWindowDays * 24 * 60 * 60 * 1000);
}

/**
 * Convenience helper for callers that want the earliest allowed start time
 * from the minimum notice rule. Returns null if the rule is disabled.
 */
export function getMinNoticeCutoff(limits: SchedulingLimits, now: Date = new Date()): Date | null {
	if (!limits.minNoticeEnabled) return null;
	return new Date(now.getTime() + limits.minNoticeMinutes * 60 * 1000);
}

/** Units supported by the "minimum scheduling notice" form input. */
export type MinNoticeUnit = 'minutes' | 'hours' | 'days';

/** Units supported by the "booking window" form input. */
export type BookingWindowUnit = 'days' | 'weeks' | 'months';

/**
 * Convert a minimum-notice value+unit pair (as entered in the event type
 * editor) into minutes, for storage in `min_notice_minutes`.
 */
export function convertToMinutes(value: number, unit: string): number {
	switch (unit as MinNoticeUnit) {
		case 'minutes':
			return value;
		case 'hours':
			return value * 60;
		case 'days':
		default:
			return value * 24 * 60;
	}
}

/**
 * Convert a booking-window value+unit pair (as entered in the event type
 * editor) into days, for storage in `booking_window_days`.
 */
export function convertToDays(value: number, unit: string): number {
	switch (unit as BookingWindowUnit) {
		case 'days':
			return value;
		case 'weeks':
			return value * 7;
		case 'months':
		default:
			return value * 30;
	}
}

/**
 * Pick the friendliest unit + value to display stored minutes back in the
 * event type editor (e.g. 4320 minutes -> { value: 3, unit: 'days' }).
 */
export function minutesToFriendlyUnit(minutes: number): { value: number; unit: MinNoticeUnit } {
	if (minutes % (24 * 60) === 0) {
		return { value: minutes / (24 * 60), unit: 'days' };
	}
	if (minutes % 60 === 0) {
		return { value: minutes / 60, unit: 'hours' };
	}
	return { value: minutes, unit: 'minutes' };
}

/**
 * Pick the friendliest unit + value to display stored days back in the
 * event type editor (e.g. 30 days -> { value: 1, unit: 'months' }).
 */
export function daysToFriendlyUnit(days: number): { value: number; unit: BookingWindowUnit } {
	if (days % 30 === 0) {
		return { value: days / 30, unit: 'months' };
	}
	if (days % 7 === 0) {
		return { value: days / 7, unit: 'weeks' };
	}
	return { value: days, unit: 'days' };
}

/**
 * Human-readable validation error message for a violated rule, useful for
 * server-side re-validation error responses on write endpoints.
 */
export function getSchedulingLimitError(

	slotStart: Date,
	limits: SchedulingLimits,
	now: Date = new Date()
): string | null {
	if (limits.minNoticeEnabled) {
		const earliestAllowed = new Date(now.getTime() + limits.minNoticeMinutes * 60 * 1000);
		if (slotStart < earliestAllowed) {
			return 'This time is too soon. Please choose a time further in the future.';
		}
	}

	if (limits.bookingWindowEnabled) {
		const latestAllowed = new Date(now.getTime() + limits.bookingWindowDays * 24 * 60 * 60 * 1000);
		if (slotStart > latestAllowed) {
			return 'This time is too far in advance. Please choose a closer date.';
		}
	}

	return null;
}
