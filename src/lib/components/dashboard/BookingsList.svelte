<script lang="ts">
	import { createFormatters } from '$lib/utils/dateFormatters';
	import { Badge, Button, Card } from '$lib/components/ui';
	import { SectionHeader } from '$lib/components/layout';

	interface Booking {
		id: string;
		event_type_name: string;
		event_type_slug: string;
		event_type_id: string;
		duration_minutes: number;
		attendee_name: string;
		attendee_email: string;
		start_time: string;
		end_time: string;
		status: string;
		attendee_notes?: string | null;
		canceled_by?: string | null;
		cancellation_reason?: string | null;
	}

	interface Props {
		bookings: Booking[];
		onCancelClick: (bookingId: string) => void;
		onRescheduleClick: (bookingId: string) => void;
	}

	let { bookings, onCancelClick, onRescheduleClick }: Props = $props();

	const { formatCompactDateTime } = createFormatters();

	let sortOrder = $state<'last_booked' | 'upcoming'>('last_booked');

	const sortedBookings = $derived(() => {
		if (!bookings) return [];
		const sorted = [...bookings];
		if (sortOrder === 'upcoming') {
			// Sort by start_time ascending, showing soonest meeting first
			sorted.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
		}
		// 'last_booked' keeps the default order (already sorted by created_at DESC from server)
		return sorted;
	});

	function getStatusVariant(status: string): 'success' | 'error' | 'warning' | 'neutral' {
		switch (status) {
			case 'confirmed':
				return 'success';
			case 'canceled':
				return 'error';
			case 'pending':
				return 'warning';
			default:
				return 'neutral';
		}
	}
</script>

<div>
	<SectionHeader title="Upcoming Bookings" class="mb-4">
		{#snippet actions()}
		<select
			bind:value={sortOrder}
			class="text-sm border border-border-medium rounded-md px-2 py-1 bg-surface-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
		>
			<option value="last_booked">Last booked</option>
			<option value="upcoming">Upcoming first</option>
		</select>
		{/snippet}
	</SectionHeader>

	<div class="space-y-4">
		{#if sortedBookings().length > 0}
			{#each sortedBookings() as booking}
				<Card padding="sm">
					<div class="flex justify-between items-start mb-2">
						<div>
							<h3 class="font-semibold text-foreground">{booking.event_type_name}</h3>
							<p class="text-sm text-muted-foreground">{booking.attendee_name}</p>
							<p class="text-xs text-subtle-foreground">{booking.attendee_email}</p>
						</div>
						<div class="flex items-center gap-2">
							<Badge variant={getStatusVariant(booking.status)}>
								{booking.status}
							</Badge>
							{#if booking.status === 'confirmed'}
								<Button
									onclick={() => onRescheduleClick(booking.id)}
									variant="ghost"
									size="sm"
									class="px-1 py-0 text-xs text-accent hover:text-accent hover:bg-transparent focus:ring-0 focus:ring-offset-0"
								>
									Reschedule
								</Button>
								<Button
									onclick={() => onCancelClick(booking.id)}
									variant="ghost"
									size="sm"
									class="px-1 py-0 text-xs text-red-600 hover:text-red-700 hover:bg-transparent focus:ring-0 focus:ring-offset-0"
								>
									Cancel
								</Button>
							{/if}
						</div>
					</div>
					<div class="text-sm text-muted-foreground mt-2">
						<p>{formatCompactDateTime(new Date(booking.start_time))}</p>
					</div>
					{#if booking.attendee_notes}
						<div class="mt-2 text-sm text-muted-foreground bg-background rounded p-2">
							<span class="font-medium">Message:</span> {booking.attendee_notes}
						</div>
					{/if}
					{#if booking.status === 'canceled'}
						<div class="mt-2 text-sm text-red-600 bg-red-50 rounded p-2">
							<span class="font-medium">Cancelled by {booking.canceled_by === 'host' ? 'you' : 'attendee'}</span>
							{#if booking.cancellation_reason}
								<span class="text-red-500">: {booking.cancellation_reason}</span>
							{/if}
						</div>
					{/if}
				</Card>
			{/each}
		{:else}
			<Card padding="lg" class="text-center">
				<p class="text-muted-foreground">No bookings yet</p>
			</Card>
		{/if}
	</div>
</div>
