<script lang="ts">
	import type { PageData } from './$types';
	import TimezoneSelector from '$lib/components/TimezoneSelector.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { detectTimezone, getCurrentTime } from '$lib/constants/timezones';
	import { formatSelectedDate } from '$lib/utils/dateFormatters';
	import { SchedulingPanel, MobileSchedulingFlow } from '$lib/components/booking';
	import { Alert, Button } from '$lib/components/ui';

	let { data }: { data: PageData } = $props();

	let selectedDate = $state<string | null>(null);
	let selectedSlot = $state<{ start: string; end: string } | null>(null);
	let availableSlots = $state<Array<{ start: string; end: string }>>([]);
	let loading = $state(false);
	let rescheduleStatus = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
	let rescheduleError = $state('');
	let newMeetingUrl = $state<string | null>(null);

	let availableDates = $state<Set<string>>(new Set());

	// Timezone state
	let selectedTimezone = $state(detectTimezone());
	let showTimezoneDropdown = $state(false);

	// Calendar state
	let currentMonth = $state(new Date());

	const use12Hour = data.timeFormat !== '24h';

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

	function formatOriginalDateTime(dateStr: string) {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'short',
			month: 'short',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: use12Hour,
			timeZone: selectedTimezone
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
			const response = await fetch(`/api/availability/month?event=${data.booking.eventSlug}&month=${monthStr}`);
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
		loading = true;
		try {
			const response = await fetch(`/api/availability?event=${data.booking.eventSlug}&date=${dateStr}`);
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

	async function handleReschedule() {
		if (!selectedSlot) return;
		rescheduleStatus = 'submitting';
		rescheduleError = '';
		try {
			const response = await fetch('/api/bookings/reschedule', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					bookingId: data.booking.id,
					newStartTime: selectedSlot.start,
					newEndTime: selectedSlot.end,
					timezone: selectedTimezone
				})
			});
			if (!response.ok) {
				const errData = await response.json() as { message?: string };
				throw new Error(errData.message || 'Failed to reschedule booking');
			}
			const result = await response.json() as { meetingUrl?: string };
			newMeetingUrl = result.meetingUrl || null;
			rescheduleStatus = 'success';
		} catch (error: any) {
			console.error('Reschedule error:', error);
			rescheduleError = error.message || 'Failed to reschedule booking';
			rescheduleStatus = 'error';
		}
	}
</script>

<svelte:head>
	<title>Reschedule Meeting</title>
</svelte:head>

<div class="min-h-screen bg-surface md:bg-background flex flex-col items-center md:justify-center md:p-4">

	{#if rescheduleStatus === 'success'}
		<!-- ──────────────── Success Screen ──────────────── -->
		<div class="bg-surface border border-border rounded-2xl shadow-lg p-8 max-w-md w-full">
			<div class="text-center">
				<div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
					</svg>
				</div>
				<h1 class="text-2xl font-semibold text-foreground mb-2">Meeting Rescheduled!</h1>
				<p class="text-muted-foreground mb-8">Your meeting has been rescheduled. A calendar update has been sent to your email.</p>
				<div class="bg-background rounded-lg p-6 text-left mb-6">
					<h3 class="font-semibold text-foreground mb-4">{data.booking.eventName}</h3>
					<div class="space-y-3 text-sm">
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
							</svg>
							<div>
								<p class="text-foreground font-medium">New Time</p>
								<p class="text-muted-foreground">{selectedSlot ? formatTimeRange(selectedSlot.start, selectedSlot.end) : ''}</p>
								<p class="text-subtle-foreground">{selectedDate ? formatSelectedDate(selectedDate) : ''}</p>
							</div>
						</div>
						{#if newMeetingUrl}
							<div class="flex items-start gap-3">
								<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
								</svg>
								<a href={newMeetingUrl} target="_blank" class="text-primary hover:underline break-all">
									{data.booking.inviteCalendar === 'outlook' ? 'Join Microsoft Teams Meeting' : 'Join Google Meet'}
								</a>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
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
				{#if data.booking.coverImage}
					<div class="px-6 pt-6 flex justify-center">
						<img src={data.booking.coverImage} alt="" class="max-h-16 w-auto object-contain" />
					</div>
					<div class="border-b border-border mx-6 mt-4"></div>
				{/if}

				<div class="flex flex-col items-center pt-8 pb-6 px-6">
					{#if data.booking.profileImage}
						<img src={data.booking.profileImage} alt={data.booking.hostName} class="w-16 h-16 rounded-full object-cover border-4 border-surface shadow-lg" />
					{:else}
						<div class="w-16 h-16 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-xl border-4 border-surface shadow-lg bg-primary">
							{data.booking.hostName?.charAt(0) || 'H'}
						</div>
					{/if}
					<p class="mt-4 text-base font-semibold text-muted-foreground">{data.booking.hostName}</p>
				</div>

				<div class="px-6 pb-5">
					<h1 class="text-2xl font-bold text-foreground text-center">{data.booking.eventName}</h1>
				</div>

				<div class="px-6 pb-5">
					<ul class="space-y-3 text-sm text-muted-foreground">
						<li class="flex items-center gap-3">
							<svg class="w-5 h-5 text-subtle-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<span>{data.booking.duration} min</span>
						</li>
						<li class="flex items-center gap-3">
							<svg class="w-5 h-5 text-subtle-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
							</svg>
							<span>{data.booking.inviteCalendar === 'outlook' ? 'Microsoft Teams' : 'Google Meet'}</span>
						</li>
						<li class="flex items-center gap-3">
							<svg class="w-5 h-5 text-subtle-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<button type="button" onclick={tzToggle} class="flex items-center gap-1 hover:text-foreground transition">
								<span>{tz} ({getCurrentTime(tz, u12)})</span>
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

				<!-- Current booking -->
				<div class="px-6 pb-5">
					<p class="text-xs font-semibold text-subtle-foreground uppercase mb-2">Current booking</p>
					<div class="bg-red-50 rounded-lg p-3 text-sm">
						<p class="font-medium text-red-900">{formatOriginalDateTime(data.booking.startTime)}</p>
						<p class="text-red-700">{data.booking.attendeeName}</p>
						<p class="text-red-600 text-xs">{data.booking.attendeeEmail}</p>
					</div>
				</div>
			{/snippet}

			{#snippet confirmStep()}
				<div class="px-6 pb-8">
					{#if rescheduleError}
						<Alert variant="error" class="p-3 mb-4">{rescheduleError}</Alert>
					{/if}
					<h2 class="text-lg font-semibold text-foreground mb-2 text-center">Confirm Reschedule</h2>
					{#if selectedSlot}
						<div class="mb-6 space-y-3">
							<div class="bg-background rounded-lg p-4 text-sm">
								<p class="text-xs font-semibold text-subtle-foreground uppercase mb-1">New time</p>
								<p class="font-medium text-foreground">{formatTimeRange(selectedSlot.start, selectedSlot.end)}</p>
								<p class="text-muted-foreground">{selectedDate ? formatSelectedDate(selectedDate) : ''}</p>
							</div>
						</div>
					{/if}
					<Button
						type="button"
						onclick={handleReschedule}
						disabled={rescheduleStatus === 'submitting' || !selectedSlot}
						fullWidth
						pill
						class="py-3 px-6 font-semibold hover:bg-border-strong"
					>
						{rescheduleStatus === 'submitting' ? 'Rescheduling...' : 'Confirm Reschedule'}
					</Button>
					<div class="mt-4 text-center">
						<a href="/cancel/{data.booking.id}" class="text-sm text-subtle-foreground hover:text-red-600 transition">
							Or cancel this meeting instead
						</a>
					</div>
				</div>
			{/snippet}
		</MobileSchedulingFlow>

		<!-- ════════════════════════════════════════════ DESKTOP ═══ -->
		<div class="hidden md:flex bg-surface border border-border rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ease-in-out" style="width: {selectedDate ? '920px' : '650px'}">

			<!-- Left Sidebar -->
			<div class="w-72 border-r border-border flex flex-col flex-shrink-0">
				{#if data.booking.coverImage}
					<div class="p-6 pb-4 flex justify-center">
						<img src={data.booking.coverImage} alt="" class="max-h-16 w-auto object-contain" />
					</div>
					<div class="border-b border-border mx-6"></div>
				{/if}
				<div class="flex-1 p-6">
					<div class="mb-6">
						{#if data.booking.profileImage}
							<img src={data.booking.profileImage} alt={data.booking.hostName} class="w-12 h-12 rounded-full object-cover mb-3" />
						{:else}
							<div class="w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-semibold text-lg mb-3 bg-primary">
								{data.booking.hostName?.charAt(0) || 'H'}
							</div>
						{/if}
						<p class="text-sm font-medium text-muted-foreground mb-1">{data.booking.hostName}</p>
						<h1 class="text-2xl font-bold text-foreground">{data.booking.eventName}</h1>
					</div>
					<div class="space-y-4 text-sm text-muted-foreground">
						<div class="flex items-center gap-3">
							<svg class="w-5 h-5 text-subtle-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
							</svg>
							<span>{data.booking.duration} min</span>
						</div>
						<div class="flex items-center gap-3">
							<svg class="w-5 h-5 text-subtle-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
							</svg>
							<span>{data.booking.inviteCalendar === 'outlook' ? 'Microsoft Teams' : 'Google Meet'}</span>
						</div>
					</div>

					<!-- Current booking info -->
					<div class="mt-6 pt-6 border-t border-border">
						<p class="text-xs font-semibold text-subtle-foreground uppercase mb-2">Current booking</p>
						<div class="bg-red-50 rounded-lg p-3 text-sm">
							<p class="font-medium text-red-900">{formatOriginalDateTime(data.booking.startTime)}</p>
							<p class="text-red-700">{data.booking.attendeeName}</p>
							<p class="text-red-600 text-xs">{data.booking.attendeeEmail}</p>
						</div>
					</div>

					{#if selectedSlot}
						<div class="mt-4">
							<p class="text-xs font-semibold text-subtle-foreground uppercase mb-2">New time</p>
							<div class="bg-green-50 rounded-lg p-3 text-sm">
								<p class="font-medium text-green-900">{formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}</p>
								<p class="text-green-700">{selectedDate ? formatSelectedDate(selectedDate) : ''}</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Main Content -->
			<div class="flex-1 p-6">
				{#if rescheduleError}
					<Alert variant="error" class="mb-6">{rescheduleError}</Alert>
				{/if}

				<SchedulingPanel
					heading="Select a New Date & Time"
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
					showSlotConfirmButton={false}
				/>

				<!-- Reschedule button -->
				{#if selectedSlot}
					<div class="mt-6 pt-6 border-t border-border">
						<Button
							type="button"
							onclick={handleReschedule}
							disabled={rescheduleStatus === 'submitting'}
							fullWidth
							pill
							class="py-3 px-6 font-semibold hover:bg-border-strong"
						>
							{rescheduleStatus === 'submitting' ? 'Rescheduling...' : 'Confirm Reschedule'}
						</Button>
					</div>
				{/if}

				<!-- Cancel link -->
				<div class="mt-4 text-center">
					<a href="/cancel/{data.booking.id}" class="text-sm text-subtle-foreground hover:text-red-600 transition">
						Or cancel this meeting instead
					</a>
				</div>
			</div>
		</div>

		<Footer class="mt-6 hidden md:block" />
	{/if}
</div>
