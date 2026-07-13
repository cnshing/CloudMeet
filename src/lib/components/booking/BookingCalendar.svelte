<script lang="ts">
	import { formatDateLocal } from '$lib/utils/dateFormatters';

	interface Props {
		currentMonth: Date;
		selectedDate: string | null;
		availableDates: Set<string>;
		onDateSelect: (dateStr: string) => void;
		onPrevMonth: () => void;
		onNextMonth: () => void;
	}

	let {
		currentMonth,
		selectedDate,
		availableDates,
		onDateSelect,
		onPrevMonth,
		onNextMonth
	}: Props = $props();

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
			days.push({
				date,
				isCurrentMonth: false,
				isAvailable: false,
				dateStr: formatDateLocal(date)
			});
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);
		for (let i = 1; i <= lastDay.getDate(); i++) {
			const date = new Date(year, month, i);
			const dateStr = formatDateLocal(date);
			// No client-side upper bound cap here - the backend's `availableDates`
			// (which reflects per-event-type booking window limits) is the source
			// of truth for which future dates are actually clickable.
			const isAvailable = date >= today;
			days.push({
				date,
				isCurrentMonth: true,
				isAvailable,
				dateStr
			});
		}


		const remaining = 42 - days.length;
		for (let i = 1; i <= remaining; i++) {
			const date = new Date(year, month + 1, i);
			days.push({
				date,
				isCurrentMonth: false,
				isAvailable: false,
				dateStr: formatDateLocal(date)
			});
		}

		return days;
	});

	function formatMonthYear(date: Date) {
		return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
	}
</script>

<div>
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-medium text-foreground">{formatMonthYear(currentMonth)}</h3>
		<div class="flex gap-2">
			<button onclick={onPrevMonth} class="p-2 hover:bg-surface-2 rounded-full transition" aria-label="Previous month">
				<svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
				</svg>
			</button>
			<button onclick={onNextMonth} class="p-2 hover:bg-surface-2 rounded-full transition" aria-label="Next month">
				<svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
				</svg>
			</button>
		</div>
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
				onclick={() => isClickable && onDateSelect(day.dateStr)}
				disabled={!isClickable}
				class="aspect-square flex items-center justify-center text-sm rounded-full transition relative
				{!day.isCurrentMonth ? 'text-subtle-foreground' : ''}
				{isClickable && !isSelected ? 'font-semibold cursor-pointer bg-accent-subtle text-border-strong' : ''}
				{day.isAvailable && !hasSlots && day.isCurrentMonth ? 'text-subtle-foreground' : ''}
				{!day.isAvailable && day.isCurrentMonth ? 'text-subtle-foreground cursor-not-allowed' : ''}
					{isSelected ? 'bg-primary text-primary-foreground' : ''}"
			>
				{day.date.getDate()}
			</button>
		{/each}
	</div>
</div>
