<script lang="ts">
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
	import TimezoneSelector from '$lib/components/TimezoneSelector.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { detectTimezone, getTimezoneWithTime } from '$lib/constants/timezones';
	import { formatSelectedDate } from '$lib/utils/dateFormatters';
	import {
		BookingForm,
		BookingSuccess,
		EventSidebar,
		SchedulingPanel,
		MobileSchedulingFlow
	} from '$lib/components/booking';
	import { Alert, Avatar, Button } from '$lib/components/ui';

	let { data }: { data: PageData } = $props();

	// Sanitize event description to prevent XSS (only in browser, SSR uses escaped version)
	let sanitizedDescription = $state('');
	$effect(() => {
		if (data.eventType?.description) {
			if (browser) {
				import('isomorphic-dompurify').then(({ default: DOMPurify }) => {
					sanitizedDescription = DOMPurify.sanitize(data.eventType!.description!);
				});
			} else {
				sanitizedDescription = data.eventType.description
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;')
					.replace(/>/g, '&gt;');
			}
		} else {
			sanitizedDescription = '';
		}
	});

	let selectedDate = $state<string | null>(null);
	let selectedSlot = $state<{ start: string; end: string } | null>(null);
	let availableSlots = $state<Array<{ start: string; end: string }>>([]);
	let loading = $state(false);
	let showForm = $state(false);
	let bookingForm = $state({ name: '', email: '', notes: '' });
	let bookingStatus = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
	let bookingError = $state('');
	let meetingUrl = $state<string | null>(null);
	let meetingType = $state<'google_meet' | 'teams'>('google_meet');

	let availableDates = $state<Set<string>>(new Set());

	// Timezone state
	let selectedTimezone = $state(detectTimezone());
	let showTimezoneDropdown = $state(false);

	// Calendar state
	let currentMonth = $state(new Date());

	const use12Hour = data.user?.timeFormat !== '24h';

	function formatTime(isoStr: string) {
		const date = new Date(isoStr);
		return new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: use12Hour,
			timeZone: selectedTimezone
		}).format(date);
	}

	function formatTimeRange(start: string, end: string) {
		return `${formatTime(start)} - ${formatTime(end)}`;
	}

	function formatShortDate(dateStr: string) {
		const date = new Date(dateStr + 'T12:00:00');
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric'
		}).format(date);
	}

	function prevMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
		fetchMonthAvailability();
	}

	function nextMonth() {
		currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
		fetchMonthAvailability();
	}

	async function fetchMonthAvailability() {
		try {
			const year = currentMonth.getFullYear();
			const month = currentMonth.getMonth() + 1;
			const monthStr = `${year}-${String(month).padStart(2, '0')}`;
			const response = await fetch(`/api/availability/month?event=${data.slug}&month=${monthStr}`);
			if (!response.ok) throw new Error('Failed to fetch availability');
			const result = await response.json() as { availableDates?: string[] };
			availableDates = new Set(result.availableDates || []);
		} catch (error) {
			console.error('Error fetching month availability:', error);
			availableDates = new Set();
		}
	}

	$effect(() => {
		fetchMonthAvailability();
	});

	async function handleDateSelect(dateStr: string) {
		selectedDate = dateStr;
		selectedSlot = null;
		showForm = false;
		loading = true;
		try {
			const response = await fetch(`/api/availability?event=${data.slug}&date=${dateStr}`);
			if (!response.ok) throw new Error('Failed to fetch availability');
			const result = await response.json() as { slots?: Array<{ start: string; end: string }> };
			availableSlots = result.slots || [];
		} catch (error) {
			console.error('Error fetching availability:', error);
			availableSlots = [];
		} finally {
			loading = false;
		}
	}

	function selectSlot(slot: { start: string; end: string }) {
		selectedSlot = slot;
	}

	/** Desktop only: show the booking form panel. Mobile step is managed by MobileSchedulingFlow. */
	function confirmSlot() {
		showForm = true;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		bookingStatus = 'submitting';
		bookingError = '';
		try {
			const response = await fetch('/api/bookings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					eventSlug: data.slug,
					startTime: selectedSlot?.start,
					endTime: selectedSlot?.end,
					attendeeName: bookingForm.name,
					attendeeEmail: bookingForm.email,
					notes: bookingForm.notes,
					timezone: selectedTimezone
				})
			});
			if (!response.ok) {
				const errData = await response.json() as { message?: string };
				throw new Error(errData.message || 'Failed to create booking');
			}
			const result = await response.json() as { meetingUrl?: string; meetingType?: 'google_meet' | 'teams' };
			meetingUrl = result.meetingUrl || null;
			meetingType = result.meetingType || 'google_meet';
			bookingStatus = 'success';
		} catch (error: any) {
			console.error('Booking error:', error);
			bookingError = error.message || 'Failed to create booking';
			bookingStatus = 'error';
		}
	}
</script>

<svelte:head>
	<title>{data.eventType?.name || 'Book a Meeting'}</title>
	<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,{encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><defs><linearGradient id='grad' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:#86c322;stop-opacity:1'/><stop offset='100%' style='stop-color:#628c20;stop-opacity:1'/></linearGradient></defs><circle cx='16' cy='16' r='15' fill='url(%23grad)'/><rect x='7' y='9' width='18' height='15' rx='2' fill='white' opacity='0.95'/><rect x='7' y='9' width='18' height='5' rx='2' fill='white'/><rect x='7' y='12' width='18' height='2' fill='#86c322'/><rect x='10' y='6' width='2.5' height='5' rx='1' fill='white'/><rect x='19.5' y='6' width='2.5' height='5' rx='1' fill='white'/><circle cx='16' cy='18' r='4' fill='none' stroke='#628c20' stroke-width='1.5'/><line x1='16' y1='18' x2='16' y2='16' stroke='#628c20' stroke-width='1.5' stroke-linecap='round'/><line x1='16' y1='18' x2='18' y2='18' stroke='#628c20' stroke-width='1.5' stroke-linecap='round'/></svg>`)}" />
</svelte:head>

<div class="min-h-screen bg-surface md:bg-background flex flex-col items-center md:justify-center md:p-4">
	{#if bookingStatus === 'success'}
		<BookingSuccess eventName={data.eventType?.name || 'Meeting'} selectedDate={selectedDate!} selectedSlot={selectedSlot!} {meetingUrl} {meetingType} {formatTimeRange} {formatSelectedDate} />
		<Footer class="mt-6" />
	{:else}

		<!-- ════════════════════════════════════════════ MOBILE ════ -->
		<MobileSchedulingFlow
			{selectedDate}
			{selectedSlot}
			{availableSlots}
			{availableDates}
			{currentMonth}
			{loading}
			{selectedTimezone}
			{showTimezoneDropdown}
			{use12Hour}
			{formatTime}
			onDateSelect={handleDateSelect}
			onSelectSlot={selectSlot}
			onConfirmSlot={() => {/* step managed by component */}}
			onPrevMonth={prevMonth}
			onNextMonth={nextMonth}
			onTimezoneToggle={() => showTimezoneDropdown = !showTimezoneDropdown}
			onTimezoneSelect={(tz) => selectedTimezone = tz}
			onTimezoneClose={() => showTimezoneDropdown = false}
		>
			{#snippet calendarHeader({ selectedTimezone: tz, use12Hour: u12, showTimezoneDropdown: showTz, onTimezoneToggle: tzToggle, onTimezoneSelect: tzSelect, onTimezoneClose: tzClose })}
				{#if data.eventType?.cover_image}
					<div class="px-6 pt-6 flex justify-center">
						<img src={data.eventType.cover_image} alt="" class="max-h-16 w-auto object-contain" />
					</div>
					<div class="border-b border-border mx-6 mt-4"></div>
				{/if}

				<div class="flex flex-col items-center pt-8 pb-6 px-6">
					<Avatar src={data.user?.profileImage} name={data.user?.name} size="lg" fallback="M" class="border-4 border-surface shadow-lg" />
					<p class="mt-4 text-base font-semibold text-muted-foreground">{data.user?.name || 'Host'}</p>
				</div>

				<div class="px-6 pb-5">
					<h1 class="text-2xl font-bold text-foreground text-center">{data.eventType?.name || 'Meeting'}</h1>
				</div>

				<div class="px-6 pb-5">
					<ul class="space-y-3 text-sm text-muted-foreground">
						<li class="flex items-center gap-3">
							<svg class="w-5 h-5 text-subtle-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<span>{data.eventType?.duration} min</span>
						</li>
						<li class="flex items-center gap-3">
							<svg class="w-5 h-5 text-subtle-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
							</svg>
							<span>{data.eventType?.invite_calendar === 'outlook' ? 'Microsoft Teams' : 'Google Meet'}</span>
						</li>
						<li class="flex items-center gap-3">
							<svg class="w-5 h-5 text-subtle-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<button type="button" onclick={tzToggle} class="flex items-center gap-1 hover:text-foreground transition">
								<span>{getTimezoneWithTime(tz, u12)}</span>
								<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
								</svg>
							</button>
						</li>
					</ul>
					{#if showTz}
						<div class="mt-2">
							<TimezoneSelector
								selectedTimezone={tz}
								onSelect={tzSelect}
								onClose={tzClose}
							/>
						</div>
					{/if}
				</div>

				{#if data.eventType?.description}
					<div class="px-6 pb-5 text-sm text-muted-foreground prose prose-sm max-w-none">
						{@html sanitizedDescription}
					</div>
				{/if}
			{/snippet}

			{#snippet confirmStep()}
				<div class="px-6 pb-8">
					{#if bookingError}
						<Alert variant="error" class="p-3 mb-4">{bookingError}</Alert>
					{/if}
					<h2 class="text-lg font-semibold text-foreground mb-2 text-center">Enter Details</h2>
					<p class="text-sm text-subtle-foreground text-center mb-6">
						{selectedDate ? formatShortDate(selectedDate) : ''}{selectedSlot ? ` at ${formatTime(selectedSlot.start)}` : ''}
					</p>
					<form onsubmit={handleSubmit} class="space-y-4">
						<div>
							<label for="mobile-name" class="block text-sm font-medium text-muted-foreground mb-1.5">Name *</label>
							<input type="text" id="mobile-name" bind:value={bookingForm.name} required
								class="w-full px-4 py-3 border border-border-medium rounded-lg focus:ring-2 focus:border-transparent outline-none text-sm"
								style="--tw-ring-color: var(--color-primary)" />
						</div>
						<div>
							<label for="mobile-email" class="block text-sm font-medium text-muted-foreground mb-1.5">Email *</label>
							<input type="email" id="mobile-email" bind:value={bookingForm.email} required
								class="w-full px-4 py-3 border border-border-medium rounded-lg focus:ring-2 focus:border-transparent outline-none text-sm"
								style="--tw-ring-color: var(--color-primary)" />
						</div>
						<div>
							<label for="mobile-notes" class="block text-sm font-medium text-muted-foreground mb-1.5">Additional notes</label>
							<textarea id="mobile-notes" bind:value={bookingForm.notes} rows="4"
								class="w-full px-4 py-3 border border-border-medium rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none text-sm"
								style="--tw-ring-color: var(--color-primary)"></textarea>
						</div>
						<Button type="submit" disabled={bookingStatus === 'submitting'} fullWidth pill class="py-3 px-6 font-semibold hover:bg-border-strong">
							{bookingStatus === 'submitting' ? 'Scheduling...' : 'Schedule Event'}
						</Button>
					</form>
				</div>
			{/snippet}
		</MobileSchedulingFlow>

		<!-- ════════════════════════════════════════════ DESKTOP ═══ -->
		<div class="hidden md:flex bg-surface border border-border rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out" style="width: {showForm ? '700px' : selectedDate ? '920px' : '650px'}">
			<EventSidebar user={data.user} eventType={data.eventType} {selectedDate} {selectedSlot} {formatTime} />

			<div class="flex-1 p-6">
				{#if bookingError}
					<Alert variant="error" class="mb-6 max-w-2xl">{bookingError}</Alert>
				{/if}

				{#if showForm}
					<BookingForm bind:bookingForm {bookingStatus} {bookingError} onSubmit={handleSubmit} />
				{:else}
					<SchedulingPanel
						heading="Select a Date & Time"
						{currentMonth}
						{selectedDate}
						{availableDates}
						{availableSlots}
						{selectedSlot}
						{loading}
						{selectedTimezone}
						{showTimezoneDropdown}
						{use12Hour}
						{formatTime}
						onDateSelect={handleDateSelect}
						onPrevMonth={prevMonth}
						onNextMonth={nextMonth}
						onSelectSlot={selectSlot}
						onTimezoneToggle={() => showTimezoneDropdown = !showTimezoneDropdown}
						onTimezoneSelect={(tz) => selectedTimezone = tz}
						onTimezoneClose={() => showTimezoneDropdown = false}
						showSlotConfirmButton={true}
						onConfirm={confirmSlot}
					/>
				{/if}
			</div>
		</div>

		<Footer class="mt-6 hidden md:block" />
	{/if}
</div>
