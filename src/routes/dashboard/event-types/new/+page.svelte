<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import SimpleWysiwyg from '$lib/components/SimpleWysiwyg.svelte';
	import { Alert, Button, Card, FormField, Spinner } from '$lib/components/ui';
	import { PageHeader, PageShell } from '$lib/components/layout';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let name = $state('');
	let slug = $state('');
	let duration = $state(30);
	let description = $state('');
	let isActive = $state(true);
	let isListed = $state(true);
	let coverImage = $state('');
	let saving = $state(false);
	let uploadingCover = $state(false);

	// Scheduling limits - both off by default so existing behavior is unaffected
	let minNoticeEnabled = $state(false);
	let minNoticeValue = $state(3);
	let minNoticeUnit = $state<'minutes' | 'hours' | 'days'>('days');
	let bookingWindowEnabled = $state(false);
	let bookingWindowValue = $state(1);
	let bookingWindowUnit = $state<'days' | 'weeks' | 'months'>('months');

	// Check which calendars are available

	const hasGoogle = data.googleConnected;
	const hasOutlook = data.outlookConnected && data.outlookConfigured;

	// Override checkbox state - defaults to false (use global settings)
	let overrideCalendarSettings = $state(false);

	// Smart defaults based on global settings or connected calendars
	function getDefaultAvailability() {
		if (data.defaultAvailabilityCalendars) return data.defaultAvailabilityCalendars;
		if (hasGoogle && hasOutlook) return 'both';
		if (hasOutlook) return 'outlook';
		return 'google';
	}

	function getDefaultInviteCalendar() {
		if (data.defaultInviteCalendar) return data.defaultInviteCalendar;
		if (hasGoogle) return 'google';
		if (hasOutlook) return 'outlook';
		return 'google';
	}

	let availabilityCalendars = $state(getDefaultAvailability());
	let inviteCalendar = $state(getDefaultInviteCalendar());

	// Labels for displaying current global settings
	function getAvailabilityLabel(val: string) {
		if (val === 'both') return 'Both calendars';
		if (val === 'outlook') return 'Outlook Calendar';
		return 'Google Calendar';
	}

	function getInviteLabel(val: string) {
		if (val === 'outlook') return 'Outlook (Microsoft Teams)';
		return 'Google Calendar (Google Meet)';
	}

	async function handleCoverUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		// Check file size (max 2MB)
		if (file.size > 2 * 1024 * 1024) {
			alert('Image must be less than 2MB');
			return;
		}

		uploadingCover = true;
		try {
			// Convert to base64
			const reader = new FileReader();
			reader.onload = () => {
				coverImage = reader.result as string;
				uploadingCover = false;
			};
			reader.onerror = () => {
				alert('Failed to read image');
				uploadingCover = false;
			};
			reader.readAsDataURL(file);
		} catch (err) {
			alert('Failed to upload image');
			uploadingCover = false;
		}
	}

	function removeCoverImage() {
		coverImage = '';
	}

	// Auto-generate slug from name
	$effect(() => {
		if (name) {
			slug = name
				.toLowerCase()
				.replace(/[^a-z0-9\s-]/g, '')
				.replace(/\s+/g, '-')
				.replace(/-+/g, '-')
				.trim();
		}
	});

	function handleSubmit() {
		saving = true;
		return async ({ update }: any) => {
			await update();
			saving = false;
		};
	}
</script>

<PageShell>
	<PageHeader title="Create Event Type" backHref="/dashboard" backLabel="Dashboard" />

	<main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if form?.error}
			<Alert variant="error" class="mb-6">Error: {form.error}</Alert>
		{/if}

		<Card>
			<form method="POST" use:enhance={handleSubmit}>
				<div class="space-y-6">
					<!-- Event Name -->
					<FormField forId="name" label="Event Name" required>
						<input type="text" id="name" name="name" bind:value={name} required placeholder="e.g., 30 Minute Meeting"
							class="w-full px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
					</FormField>

					<!-- Slug -->
					<FormField forId="slug" label="URL Slug" required help="Only lowercase letters, numbers, and hyphens.">
						<input type="text" id="slug" name="slug" bind:value={slug} required pattern="[a-z0-9\-]+" placeholder="e.g., 30min"
							class="w-full px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
					</FormField>

					<!-- Duration -->
					<FormField forId="duration" label="Duration (minutes)" required>
						<select id="duration" name="duration" bind:value={duration} required
							class="w-full px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
							<option value={15}>15 minutes</option>
							<option value={30}>30 minutes</option>
							<option value={45}>45 minutes</option>
							<option value={60}>60 minutes</option>
							<option value={90}>90 minutes</option>
							<option value={120}>2 hours</option>
						</select>
					</FormField>

					<!-- Description -->
					<div>
						<label for="description" class="block text-sm font-medium text-muted-foreground mb-2">Description</label>
						<SimpleWysiwyg bind:value={description} placeholder="Describe what this meeting is for..." />
						<input type="hidden" name="description" value={description} />
					</div>

					<!-- Cover Image -->
					<div>
						<label class="block text-sm font-medium text-muted-foreground mb-2">Cover Image</label>
						<p class="text-xs text-subtle-foreground mb-3">Displayed at the top of your booking page</p>
						{#if coverImage}
							<div class="relative mb-3 p-4 bg-surface-2 rounded-lg">
								<img src={coverImage} alt="Cover preview" class="max-h-20 w-auto object-contain mx-auto" />
								<button type="button" onclick={removeCoverImage} class="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition">
									<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
								</button>
							</div>
						{/if}
						<label class="flex items-center justify-center w-full h-32 border-2 border-dashed border-border-medium rounded-lg cursor-pointer hover:border-border-primary hover:bg-accent-subtle transition {coverImage ? 'hidden' : ''}">
							<input type="file" accept="image/*" onchange={handleCoverUpload} class="hidden" disabled={uploadingCover} />
							{#if uploadingCover}
								<div class="flex items-center gap-2 text-muted-foreground">
									<Spinner size="sm" />
									<span>Uploading...</span>
								</div>
							{:else}
								<div class="text-center">
									<svg class="w-8 h-8 mx-auto text-subtle-foreground mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
									<p class="text-sm text-subtle-foreground">Click to upload cover image</p>
									<p class="text-xs text-subtle-foreground">Max 2MB</p>
								</div>
							{/if}
						</label>
						<input type="hidden" name="cover_image" value={coverImage} />
					</div>

					<!-- Calendar Settings -->
					{#if hasGoogle || hasOutlook}
						<div class="border-t border-border pt-6">
							<h3 class="text-sm font-medium text-foreground mb-4">Calendar Settings</h3>
							<!-- Show current global settings -->
							<div class="mb-4 p-3 bg-background rounded-lg text-sm border border-border">
								<p class="text-muted-foreground mb-1"><span class="font-medium">Check availability from:</span> {getAvailabilityLabel(getDefaultAvailability())}</p>
								<p class="text-muted-foreground"><span class="font-medium">Send invite via:</span> {getInviteLabel(getDefaultInviteCalendar())}</p>
								<p class="text-xs text-subtle-foreground mt-2">These are your global settings. <a href="/dashboard" class="text-accent hover:underline">Change in Dashboard</a></p>
							</div>

							<!-- Override checkbox -->
							<div class="flex items-center mb-4">
								<input type="checkbox" id="override_calendar_settings" name="override_calendar_settings" bind:checked={overrideCalendarSettings} class="h-4 w-4 text-primary rounded border-border-medium" />
								<label for="override_calendar_settings" class="ml-2 text-sm text-muted-foreground">Override global calendar settings for this event type</label>
							</div>

							{#if overrideCalendarSettings}
								<!-- Availability Calendars -->
								<div class="mb-4">
									<label for="availability_calendars" class="block text-sm font-medium text-muted-foreground mb-2">Check availability from</label>
									<select id="availability_calendars" name="availability_calendars" bind:value={availabilityCalendars} class="w-full px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
										{#if hasGoogle && hasOutlook}<option value="both">Both Google & Outlook calendars</option>{/if}
										{#if hasGoogle}<option value="google">Google Calendar only</option>{/if}
										{#if hasOutlook}<option value="outlook">Outlook Calendar only</option>{/if}
									</select>
									<p class="text-xs text-subtle-foreground mt-1">
										Which calendars to check when showing available time slots
									</p>
								</div>

								<!-- Invite Calendar -->
								<div>
									<label for="invite_calendar" class="block text-sm font-medium text-muted-foreground mb-2">Send calendar invite via</label>
									<select id="invite_calendar" name="invite_calendar" bind:value={inviteCalendar} class="w-full px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
										{#if hasGoogle}<option value="google">Google Calendar (with Google Meet)</option>{/if}
										{#if hasOutlook}<option value="outlook">Outlook Calendar (with Microsoft Teams)</option>{/if}
									</select>
									<p class="text-xs text-subtle-foreground mt-1">
										The attendee will receive an invite from this calendar with the meeting link
									</p>
								</div>
							{/if}
						</div>
					{:else}
						<div class="border-t border-border pt-6">
							<p class="text-sm text-subtle-foreground">Connect a calendar in <a href="/dashboard" class="text-accent hover:underline">Dashboard Settings</a> to configure calendar options.</p>
						</div>
					{/if}

					<!-- Scheduling Limits -->
					<div class="border-t border-border pt-6">
						<h3 class="text-sm font-medium text-foreground mb-4">Scheduling Limits</h3>

						<!-- Minimum notice -->
						<div class="mb-4">
							<div class="flex items-start">
								<input type="checkbox" id="min_notice_enabled" name="min_notice_enabled" bind:checked={minNoticeEnabled} class="h-4 w-4 text-primary rounded border-border-medium mt-0.5" />
								<div class="ml-2">
									<label for="min_notice_enabled" class="text-sm text-muted-foreground">Require minimum scheduling notice</label>
									<p class="text-xs text-subtle-foreground mt-1">Prevent bookings within a certain amount of time from now (e.g. can't book within the next 3 days).</p>
								</div>
							</div>
							{#if minNoticeEnabled}
								<div class="mt-3 ml-6 flex items-center gap-2">
									<input type="number" name="min_notice_value" min="1" step="1" bind:value={minNoticeValue}
										class="w-24 px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
									<select name="min_notice_unit" bind:value={minNoticeUnit}
										class="px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
										<option value="minutes">Minutes</option>
										<option value="hours">Hours</option>
										<option value="days">Days</option>
									</select>
								</div>
							{/if}
						</div>

						<!-- Booking window -->
						<div>
							<div class="flex items-start">
								<input type="checkbox" id="booking_window_enabled" name="booking_window_enabled" bind:checked={bookingWindowEnabled} class="h-4 w-4 text-primary rounded border-border-medium mt-0.5" />
								<div class="ml-2">
									<label for="booking_window_enabled" class="text-sm text-muted-foreground">Limit how far in advance people can book</label>
									<p class="text-xs text-subtle-foreground mt-1">Prevent bookings beyond a certain date (e.g. can't book more than 1 month ahead).</p>
								</div>
							</div>
							{#if bookingWindowEnabled}
								<div class="mt-3 ml-6 flex items-center gap-2">
									<input type="number" name="booking_window_value" min="1" step="1" bind:value={bookingWindowValue}
										class="w-24 px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-primary focus:border-transparent" />
									<select name="booking_window_unit" bind:value={bookingWindowUnit}
										class="px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
										<option value="days">Days</option>
										<option value="weeks">Weeks</option>
										<option value="months">Months</option>
									</select>
								</div>
							{/if}
						</div>
					</div>

					<!-- Is Active -->
					<div class="space-y-4 border-t border-border pt-6">
						<div class="flex items-start">
							<input type="checkbox" id="is_listed" name="is_listed" bind:checked={isListed} class="h-4 w-4 text-primary rounded border-border-medium mt-0.5" />

							<div class="ml-2">
								<label for="is_listed" class="text-sm text-muted-foreground">Show on public booking page</label>
								<p class="text-xs text-subtle-foreground mt-1">Turn this off to make the event unlisted. Anyone with the direct link can still book it.</p>
							</div>
						</div>

						<div class="flex items-start">
							<input type="checkbox" id="is_active" name="is_active" bind:checked={isActive} class="h-4 w-4 text-primary rounded border-border-medium mt-0.5" />
							<div class="ml-2">
								<label for="is_active" class="text-sm text-muted-foreground">Active (allow people to book this event type)</label>
								<p class="text-xs text-subtle-foreground mt-1">Inactive event types cannot be booked, even with a direct link.</p>
							</div>
						</div>
					</div>

					<!-- Submit -->
					<div class="flex gap-4 pt-4">
						<Button type="submit" disabled={saving}>
							{saving ? 'Creating...' : 'Create Event Type'}
						</Button>
						<Button href="/dashboard" variant="outline">Cancel</Button>
					</div>
				</div>
			</form>
		</Card>
	</main>
</PageShell>
