<!--
	Shared desktop scheduling panel: calendar + timezone picker + time slot list.
	Used by both the booking route ([slug]) and the reschedule route (reschedule/[id]).
-->
<script lang="ts">
	import TimezoneSelector from '$lib/components/TimezoneSelector.svelte';
	import { BookingCalendar, TimeSlotList } from '$lib/components/booking';
	import { getTimezoneWithTime } from '$lib/constants/timezones';

	interface TimeSlot {
		start: string;
		end: string;
	}

	interface Props {
		heading: string;
		currentMonth: Date;
		selectedDate: string | null;
		availableDates: Set<string>;
		availableSlots: TimeSlot[];
		selectedSlot: TimeSlot | null;
		loading: boolean;
		selectedTimezone: string;
		showTimezoneDropdown: boolean;
		use12Hour: boolean;
		formatTime: (isoStr: string) => string;
		onDateSelect: (dateStr: string) => void;
		onPrevMonth: () => void;
		onNextMonth: () => void;
		onSelectSlot: (slot: TimeSlot) => void;
		onTimezoneToggle: () => void;
		onTimezoneSelect: (tz: string) => void;
		onTimezoneClose: () => void;
		/**
		 * Whether to show an inline "Next" confirm button in the time slot list.
		 * Pass false for reschedule flows where the confirm action is a page-level button.
		 */
		showSlotConfirmButton?: boolean;
		onConfirm?: () => void;
	}

	let {
		heading,
		currentMonth,
		selectedDate,
		availableDates,
		availableSlots,
		selectedSlot,
		loading,
		selectedTimezone,
		showTimezoneDropdown,
		use12Hour,
		formatTime,
		onDateSelect,
		onPrevMonth,
		onNextMonth,
		onSelectSlot,
		onTimezoneToggle,
		onTimezoneSelect,
		onTimezoneClose,
		showSlotConfirmButton = true,
		onConfirm
	}: Props = $props();
</script>

<div class="flex h-full min-h-0 items-stretch">
	<div class="w-80">
		<h2 class="text-xl font-semibold text-foreground mb-6">{heading}</h2>

		<BookingCalendar
			{currentMonth}
			{selectedDate}
			{availableDates}
			onDateSelect={onDateSelect}
			onPrevMonth={onPrevMonth}
			onNextMonth={onNextMonth}
		/>

		<div class="mt-6 relative">
			<p class="text-sm font-semibold text-foreground mb-2">Time zone</p>
			<button
				type="button"
				onclick={onTimezoneToggle}
				class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
			>
				<svg class="w-4 h-4 text-subtle-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				<span>{getTimezoneWithTime(selectedTimezone, use12Hour)}</span>
				<svg class="w-4 h-4 text-subtle-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
				</svg>
			</button>
			{#if showTimezoneDropdown}
				<TimezoneSelector
					{selectedTimezone}
					onSelect={onTimezoneSelect}
					onClose={onTimezoneClose}
				/>
			{/if}
		</div>
	</div>

	{#if selectedDate}
		<TimeSlotList
			{selectedDate}
			{availableSlots}
			{selectedSlot}
			{loading}
			{formatTime}
			onSelectSlot={onSelectSlot}
			showConfirmButton={showSlotConfirmButton}
			onConfirm={onConfirm}
		/>
	{/if}
</div>
