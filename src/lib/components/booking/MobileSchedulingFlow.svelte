<!--
	Shared mobile step-based scheduling flow (calendar → times → details/confirm).
	Used by both the booking route ([slug]) and the reschedule route (reschedule/[id]).

	• calendarHeader snippet — renders host/event info above the calendar (step 1).
	  Receives { selectedTimezone, use12Hour, showTimezoneDropdown } as params so the
	  caller can render the timezone picker inline.
	• confirmStep snippet — rendered as-is in step 3 (booking form or reschedule button).
	  The snippet owns its own heading, subtitle, error display, and form/button.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { formatSelectedDate, formatDateLocal } from '$lib/utils/dateFormatters';
	import { Spinner, Button } from '$lib/components/ui';

	interface TimeSlot {
		start: string;
		end: string;
	}

	interface Props {
		// --- Shared scheduling state ---
		selectedDate: string | null;
		selectedSlot: TimeSlot | null;
		availableSlots: TimeSlot[];
		availableDates: Set<string>;
		currentMonth: Date;
		loading: boolean;
		selectedTimezone: string;
		showTimezoneDropdown: boolean;
		use12Hour: boolean;

		// --- Handlers ---
		formatTime: (isoStr: string) => string;
		/** Called when the user picks a date. The component advances to the times step. */
		onDateSelect: (dateStr: string) => void;
		onSelectSlot: (slot: TimeSlot) => void;
		/** Called when the user clicks "Next" from the times step. Advance to confirm step. */
		onConfirmSlot: () => void;
		onPrevMonth: () => void;
		onNextMonth: () => void;
		/** Toggle the timezone dropdown; pass through to calendarHeader snippet. */
		onTimezoneToggle: () => void;
		/** Select a new timezone; pass through to calendarHeader snippet. */
		onTimezoneSelect: (tz: string) => void;
		/** Close the timezone dropdown; pass through to calendarHeader snippet. */
		onTimezoneClose: () => void;

		/**
		 * Rendered at the top of the calendar step (host avatar, event title, details, etc.).
		 * Receives timezone-related values so the caller can render a timezone picker inline.
		 */
		calendarHeader?: Snippet<[{ selectedTimezone: string; use12Hour: boolean; showTimezoneDropdown: boolean; onTimezoneToggle: () => void; onTimezoneSelect: (tz: string) => void; onTimezoneClose: () => void }]>;

		/**
		 * Rendered as the entire body of step 3 (heading, error, form/button, etc.).
		 * The snippet owns its own padding, headings, and actions.
		 */
		confirmStep?: Snippet;
	}

	let {
		selectedDate,
		selectedSlot,
		availableSlots,
		availableDates,
		currentMonth,
		loading,
		selectedTimezone,
		showTimezoneDropdown,
		use12Hour,
		formatTime,
		onDateSelect,
		onSelectSlot,
		onConfirmSlot,
		onPrevMonth,
		onNextMonth,
		onTimezoneToggle,
		onTimezoneSelect,
		onTimezoneClose,
		calendarHeader,
		confirmStep
	}: Props = $props();

	// Mobile step tracking (internal)
	let mobileStep = $state<'calendar' | 'times' | 'confirm'>('calendar');

	const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	const calendarDays = $derived(() => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		const startPadding = (firstDay.getDay() + 6) % 7;
		const days: Array<{ date: Date; isCurrentMonth: boolean; isAvailable: boolean; dateStr: string }> = [];

		for (let i = 0; i < startPadding; i++) {
			const date = new Date(year, month, i - startPadding + 1);
			days.push({ date, isCurrentMonth: false, isAvailable: false, dateStr: formatDateLocal(date) });
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		for (let i = 1; i <= lastDay.getDate(); i++) {
			const date = new Date(year, month, i);
			const dateStr = formatDateLocal(date);
			const isAvailable = date >= today && date <= new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000);
			days.push({ date, isCurrentMonth: true, isAvailable, dateStr });
		}

		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			const date = new Date(year, month + 1, i);
			days.push({ date, isCurrentMonth: false, isAvailable: false, dateStr: formatDateLocal(date) });
		}
		return days;
	});

	function formatMonthYear(date: Date) {
		return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
	}

	function handleDateSelect(dateStr: string) {
		onDateSelect(dateStr);
		mobileStep = 'times';
	}

	function handleSlotConfirm() {
		onConfirmSlot();
		mobileStep = 'confirm';
	}

	function goBack() {
		if (mobileStep === 'confirm') {
			mobileStep = 'times';
		} else if (mobileStep === 'times') {
			mobileStep = 'calendar';
		}
	}
</script>

<div class="md:hidden min-h-screen w-full bg-surface">
	<!-- Back button for non-calendar steps -->
	{#if mobileStep !== 'calendar'}
		<div class="px-6 py-4">
			<button onclick={goBack} class="flex items-center gap-2 text-muted-foreground hover:text-foreground" aria-label="Go back">
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
				</svg>
				<span class="text-sm">Back</span>
			</button>
		</div>
	{/if}

	<!-- ─── Step 1: Calendar ───────────────────────────────── -->
	{#if mobileStep === 'calendar'}
		<!-- Route-specific header (host, event info, timezone, description) -->
		{#if calendarHeader}
			{@render calendarHeader({ selectedTimezone, use12Hour, showTimezoneDropdown, onTimezoneToggle, onTimezoneSelect, onTimezoneClose })}
		{/if}

		<div class="border-b border-border mx-6 mb-6"></div>

		<div class="px-6 pb-8">
			<h2 class="text-lg font-semibold text-foreground mb-5 text-center">Select a Date & Time</h2>

			<div class="flex items-center justify-between mb-4">
				<button onclick={onPrevMonth} class="p-2 hover:bg-surface-2 rounded-full transition" aria-label="Previous month">
					<svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
					</svg>
				</button>
				<h3 class="text-base font-semibold text-foreground">{formatMonthYear(currentMonth)}</h3>
				<button onclick={onNextMonth} class="p-2 hover:bg-surface-2 rounded-full transition" aria-label="Next month">
					<svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
					</svg>
				</button>
			</div>

			<div class="grid grid-cols-7 gap-1 mb-2">
				{#each weekDays as day}
					<div class="text-center text-xs font-medium text-subtle-foreground py-2">{day}</div>
				{/each}
			</div>

			<div class="grid grid-cols-7 gap-1">
				{#each calendarDays() as day}
					{@const hasSlots = availableDates.has(day.dateStr)}
					{@const isClickable = day.isAvailable && hasSlots}
					{@const isSelected = selectedDate === day.dateStr}
					<button
						type="button"
						onclick={() => isClickable && handleDateSelect(day.dateStr)}
						disabled={!isClickable}
						class="aspect-square flex items-center justify-center text-sm rounded-full transition
						{!day.isCurrentMonth ? 'text-subtle-foreground' : ''}
						{isClickable && !isSelected ? 'font-semibold bg-accent-subtle text-border-strong' : ''}
						{day.isAvailable && !hasSlots && day.isCurrentMonth ? 'text-subtle-foreground' : ''}
						{!day.isAvailable && day.isCurrentMonth ? 'text-subtle-foreground' : ''}
						{isSelected ? 'bg-primary text-primary-foreground' : ''}"
					>
						{day.date.getDate()}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- ─── Step 2: Time slots ─────────────────────────────── -->
	{#if mobileStep === 'times'}
		<div class="px-6 pb-8">
			<h2 class="text-lg font-semibold text-foreground mb-2 text-center">Select a Time</h2>
			<p class="text-sm text-subtle-foreground text-center mb-6">
				{selectedDate ? formatSelectedDate(selectedDate) : ''}
			</p>
			{#if loading}
				<div class="flex items-center justify-center py-8">
					<Spinner />
				</div>
			{:else if availableSlots.length === 0}
				<p class="text-sm text-subtle-foreground py-4 text-center">No available times for this date</p>
			{:else}
				<div class="grid grid-cols-2 gap-3">
					{#each availableSlots as slot}
						{@const isSelected = selectedSlot === slot}
						<button
							type="button"
							onclick={() => onSelectSlot(slot)}
							class="py-3 px-4 border-2 rounded-lg text-sm font-semibold transition
							{isSelected ? 'border-foreground bg-foreground text-background' : 'border-primary text-primary hover:bg-accent-subtle'}"
						>
							{formatTime(slot.start)}
						</button>
					{/each}
				</div>
				{#if selectedSlot}
					<Button
						type="button"
						onclick={handleSlotConfirm}
						fullWidth
						pill
						class="mt-6 py-3 px-6 font-semibold hover:bg-border-strong"
					>
						Next
					</Button>
				{/if}
			{/if}
		</div>
	{/if}

	<!-- ─── Step 3: Confirm / Details ─────────────────────── -->
	{#if mobileStep === 'confirm'}
		{#if confirmStep}
			{@render confirmStep()}
		{/if}
	{/if}

	<Footer class="px-6 pb-8" />
</div>
