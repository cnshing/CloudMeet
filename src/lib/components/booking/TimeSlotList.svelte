<script lang="ts">
	import { formatSelectedDate } from '$lib/utils/dateFormatters';
	import { Button, Spinner } from '$lib/components/ui';

	interface TimeSlot {
		start: string;
		end: string;
	}

	interface Props {
		selectedDate: string;
		availableSlots: TimeSlot[];
		selectedSlot: TimeSlot | null;
		loading: boolean;
		formatTime: (isoStr: string) => string;
		onSelectSlot: (slot: TimeSlot) => void;
		/** Called when the user clicks "Next" after selecting a slot. Only relevant when showConfirmButton is true. */
		onConfirm?: () => void;
		/**
		 * Whether to show an inline "Next" confirm button next to the selected slot.
		 * Set to false for reschedule flows where the confirm action is a page-level button.
		 * Defaults to true.
		 */
		showConfirmButton?: boolean;
		/** Label for the empty-slots message. Defaults to "No available times". */
		emptyLabel?: string;
	}

	let {
		selectedDate,
		availableSlots,
		selectedSlot,
		loading,
		formatTime,
		onSelectSlot,
		onConfirm,
		showConfirmButton = true,
		emptyLabel = 'No available times'
	}: Props = $props();
</script>

<div class="w-52 ml-6 border-l border-border pl-6 flex flex-col" style="max-height: 400px;">
	<h3 class="text-sm font-medium text-subtle-foreground mb-4 flex-shrink-0">
		{formatSelectedDate(selectedDate).split(',')[0]}
	</h3>

	{#if loading}
		<div class="flex items-center justify-center py-8">
			<Spinner />
		</div>
	{:else if availableSlots.length === 0}
		<p class="text-sm text-subtle-foreground py-4">{emptyLabel}</p>
	{:else}
		<div class="space-y-2 overflow-y-auto flex-1 pr-2 pb-2 scrollbar-thin">
			{#each availableSlots as slot}
				{#if selectedSlot === slot}
					<div class="flex gap-2">
						<Button type="button" variant="outline" class="flex-1 py-2.5 px-3 border-2 border-foreground bg-foreground text-background text-sm font-semibold hover:bg-foreground">
							{formatTime(slot.start)}
						</Button>
						{#if showConfirmButton && onConfirm}
							<Button
								type="button"
								onclick={onConfirm}
								class="flex-1 py-2.5 px-3 text-sm font-semibold hover:bg-border-strong"
							>
								Next
							</Button>
						{/if}
					</div>
				{:else}
					<Button
						type="button"
						onclick={() => onSelectSlot(slot)}
						variant="outline"
						fullWidth
						class="py-2.5 px-3 border-2 border-primary text-primary text-sm font-semibold hover:bg-accent-subtle"
					>
						{formatTime(slot.start)}
					</Button>
				{/if}
			{/each}
		</div>
	{/if}
</div>
