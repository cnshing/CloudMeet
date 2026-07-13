/**
 * Edit event type
 */

import { redirect, fail, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getCurrentUser } from '$lib/server/auth';
import { validateLength, validateFields, MAX_LENGTHS } from '$lib/server/validation';
import { convertToMinutes, convertToDays, minutesToFriendlyUnit, daysToFriendlyUnit } from '$lib/server/scheduling-limits';


export const load: PageServerLoad = async (event) => {
	const userId = await getCurrentUser(event);

	if (!userId) {
		throw redirect(302, '/auth/login');
	}

	const db = event.platform?.env?.DB;
	if (!db) {
		throw error(500, 'Database not available');
	}

	const eventTypeId = event.params.id;

	// Get user info for calendar connection status and settings
	const user = await db
		.prepare('SELECT google_refresh_token, outlook_refresh_token, settings FROM users WHERE id = ?')
		.bind(userId)
		.first<{ google_refresh_token: string | null; outlook_refresh_token: string | null; settings: string | null }>();

	// Check if Microsoft OAuth is configured
	const outlookConfigured = !!(event.platform?.env?.MICROSOFT_CLIENT_ID && event.platform?.env?.MICROSOFT_CLIENT_SECRET);

	// Parse user settings for global calendar defaults
	let userSettings: {
		defaultAvailabilityCalendars?: 'google' | 'outlook' | 'both';
		defaultInviteCalendar?: 'google' | 'outlook';
	} = {};
	try {
		userSettings = user?.settings ? JSON.parse(user.settings) : {};
	} catch {
		userSettings = {};
	}

	// Get event type
	const eventType = await db
		.prepare(
			`SELECT id, name, slug, duration_minutes as duration, description, is_active, is_listed, cover_image,
				availability_calendars, invite_calendar,
				min_notice_enabled, min_notice_minutes, booking_window_enabled, booking_window_days
			FROM event_types
			WHERE id = ? AND user_id = ?`
		)
		.bind(eventTypeId, userId)
		.first<{
			id: string;
			name: string;
			slug: string;
			duration: number;
			description: string;
			is_active: number;
			is_listed: number;
			cover_image: string | null;
			availability_calendars: string | null;
			invite_calendar: string | null;
			min_notice_enabled: number | null;
			min_notice_minutes: number | null;
			booking_window_enabled: number | null;
			booking_window_days: number | null;
		}>();


	if (!eventType) {
		throw error(404, 'Event type not found');
	}

	// Convert stored minutes/days back to friendliest unit for editor display
	const minNoticeFriendly = minutesToFriendlyUnit(eventType.min_notice_minutes ?? 4320);
	const bookingWindowFriendly = daysToFriendlyUnit(eventType.booking_window_days ?? 30);

	return {
		eventType,
		minNoticeValue: minNoticeFriendly.value,
		minNoticeUnit: minNoticeFriendly.unit,
		bookingWindowValue: bookingWindowFriendly.value,
		bookingWindowUnit: bookingWindowFriendly.unit,
		googleConnected: !!user?.google_refresh_token,
		outlookConnected: !!user?.outlook_refresh_token,
		outlookConfigured,
		defaultAvailabilityCalendars: userSettings.defaultAvailabilityCalendars,
		defaultInviteCalendar: userSettings.defaultInviteCalendar
	};
};


export const actions: Actions = {
	default: async (event) => {
		const userId = await getCurrentUser(event);

		if (!userId) {
			throw redirect(302, '/auth/login');
		}

		const db = event.platform?.env?.DB;
		if (!db) {
			return fail(500, { error: 'Database not available' });
		}

		const eventTypeId = event.params.id;

		// Verify ownership
		const existing = await db
			.prepare('SELECT id FROM event_types WHERE id = ? AND user_id = ?')
			.bind(eventTypeId, userId)
			.first();

		if (!existing) {
			return fail(404, { error: 'Event type not found' });
		}

		const formData = await event.request.formData();
		const name = formData.get('name');
		const slug = formData.get('slug');
		const duration = formData.get('duration');
		const description = formData.get('description') || '';
		const isActive = formData.get('is_active') === 'on';
		const isListed = formData.get('is_listed') === 'on';
		const coverImage = formData.get('cover_image') || null;
		const overrideCalendarSettings = formData.get('override_calendar_settings') === 'on';
		// Only use custom values if override is enabled, otherwise null (use global)
		const availabilityCalendars = overrideCalendarSettings ? (formData.get('availability_calendars') || 'both') : null;
		const inviteCalendar = overrideCalendarSettings ? (formData.get('invite_calendar') || 'google') : null;

		// Scheduling limits (both off by default)
		const minNoticeEnabled = formData.get('min_notice_enabled') === 'on';
		const minNoticeValue = parseFloat(formData.get('min_notice_value')?.toString() || '3');
		const minNoticeUnit = formData.get('min_notice_unit')?.toString() || 'days';
		const bookingWindowEnabled = formData.get('booking_window_enabled') === 'on';
		const bookingWindowValue = parseFloat(formData.get('booking_window_value')?.toString() || '30');
		const bookingWindowUnit = formData.get('booking_window_unit')?.toString() || 'days';

		if (!name || !slug || !duration) {
			return fail(400, { error: 'Missing required fields' });
		}

		// Validate & convert scheduling limit inputs
		if (minNoticeEnabled && (!Number.isFinite(minNoticeValue) || minNoticeValue <= 0)) {
			return fail(400, { error: 'Minimum notice must be a positive number' });
		}
		if (bookingWindowEnabled && (!Number.isFinite(bookingWindowValue) || bookingWindowValue <= 0)) {
			return fail(400, { error: 'Booking window must be a positive number' });
		}

		const minNoticeMinutes = minNoticeEnabled
			? Math.round(convertToMinutes(minNoticeValue, minNoticeUnit))
			: 4320;
		const bookingWindowDays = bookingWindowEnabled
			? Math.round(convertToDays(bookingWindowValue, bookingWindowUnit))
			: 30;

		// Sanity caps: min notice up to 90 days, booking window up to 2 years
		if (minNoticeEnabled && minNoticeMinutes > 90 * 24 * 60) {
			return fail(400, { error: 'Minimum notice cannot exceed 90 days' });
		}
		if (bookingWindowEnabled && bookingWindowDays > 730) {
			return fail(400, { error: 'Booking window cannot exceed 2 years' });
		}


		// Validate input lengths
		const lengthError = validateFields([
			validateLength(name.toString(), 'Name', MAX_LENGTHS.name, true),
			validateLength(slug.toString(), 'Slug', MAX_LENGTHS.slug, true),
			validateLength(description.toString(), 'Description', MAX_LENGTHS.description, false)
		]);
		if (lengthError) {
			return fail(400, { error: lengthError });
		}

		// Validate slug is URL-safe
		const slugStr = slug.toString().toLowerCase();
		if (!/^[a-z0-9-]+$/.test(slugStr)) {
			return fail(400, {
				error: 'Slug can only contain lowercase letters, numbers, and hyphens'
			});
		}

		try {
			// Check if slug already exists for this user (excluding current event type)
			const slugExists = await db
				.prepare('SELECT id FROM event_types WHERE user_id = ? AND slug = ? AND id != ?')
				.bind(userId, slugStr, eventTypeId)
				.first();

			if (slugExists) {
				return fail(400, { error: 'An event type with this slug already exists' });
			}

			// Update event type
			await db
				.prepare(
					`UPDATE event_types
					SET name = ?, slug = ?, duration_minutes = ?, description = ?, is_active = ?, is_listed = ?, cover_image = ?,
						availability_calendars = ?, invite_calendar = ?,
						min_notice_enabled = ?, min_notice_minutes = ?, booking_window_enabled = ?, booking_window_days = ?
					WHERE id = ? AND user_id = ?`
				)
				.bind(
					name.toString(),
					slugStr,
					parseInt(duration.toString()),
					description.toString(),
					isActive ? 1 : 0,
					isListed ? 1 : 0,
					coverImage ? coverImage.toString() : null,
					availabilityCalendars ? availabilityCalendars.toString() : null,
					inviteCalendar ? inviteCalendar.toString() : null,
					minNoticeEnabled ? 1 : 0,
					minNoticeMinutes,
					bookingWindowEnabled ? 1 : 0,
					bookingWindowDays,
					eventTypeId,
					userId
				)
				.run();


			throw redirect(302, '/dashboard');
		} catch (error: any) {
			if (error?.status === 302) throw error; // Re-throw redirects
			console.error('Error updating event type:', error);
			return fail(500, { error: 'Failed to update event type' });
		}
	}
};
