<script lang="ts">
	import type { PageData } from './$types';
	import { ProfileSection, CancelBookingModal, HostRescheduleModal, BookingsList, EventTypesList } from '$lib/components/dashboard';
	import { Alert, Button, Card } from '$lib/components/ui';
	import { PageHeader, PageShell } from '$lib/components/layout';

	let { data }: { data: PageData } = $props();

	// Local reactive copy of bookings for UI updates
	let bookings = $state(data.recentBookings || []);

	// Cancel booking state
	let cancellingBookingId = $state<string | null>(null);
	let showCancelModal = $state(false);
	let cancelSuccess = $state('');

	// Reschedule booking state
	let reschedulingBookingId = $state<string | null>(null);
	let rescheduleSuccess = $state('');

	function openCancelModal(bookingId: string) {
		cancellingBookingId = bookingId;
		showCancelModal = true;
	}

	function closeCancelModal() {
		showCancelModal = false;
		cancellingBookingId = null;
	}

	async function cancelBooking(message: string) {
		if (!cancellingBookingId) return;

		const response = await fetch('/api/bookings/cancel', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				bookingId: cancellingBookingId,
				message: message || null
			})
		});

		if (!response.ok) {
			const errData = await response.json() as { message?: string };
			throw new Error(errData.message || 'Failed to cancel booking');
		}

		// Update local reactive state for immediate UI update
		bookings = bookings.map(b =>
			b.id === cancellingBookingId
				? { ...b, status: 'canceled' }
				: b
		);

		cancelSuccess = 'Booking cancelled successfully';
		closeCancelModal();
		setTimeout(() => cancelSuccess = '', 3000);
	}

	function getBookingById(bookingId: string | null) {
		if (!bookingId) return null;
		return bookings.find(b => b.id === bookingId) || null;
	}

	// Reschedule functions
	function openRescheduleModal(bookingId: string) {
		reschedulingBookingId = bookingId;
	}

	function closeRescheduleModal() {
		reschedulingBookingId = null;
	}

	async function submitRescheduleProposal(bookingId: string, newStartTime: string, newEndTime: string, message: string) {
		const response = await fetch('/api/bookings/propose-reschedule', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				bookingId,
				proposedStartTime: newStartTime,
				proposedEndTime: newEndTime,
				message: message || null
			})
		});

		if (!response.ok) {
			const errData = await response.json() as { message?: string };
			throw new Error(errData.message || 'Failed to send reschedule proposal');
		}

		// Update local state - mark as pending reschedule
		bookings = bookings.map(b =>
			b.id === bookingId
				? { ...b, status: 'rescheduled' }
				: b
		);

		rescheduleSuccess = 'Reschedule proposal sent to attendee';
		closeRescheduleModal();
		setTimeout(() => rescheduleSuccess = '', 3000);
	}
</script>

<PageShell>
	<PageHeader title="Dashboard" subtitle="Welcome back, {data.user?.name || 'User'}!">
		{#snippet actions()}
			<Button href="/dashboard/calendars" variant="secondary">Calendars</Button>
			<Button href="/dashboard/emails" variant="secondary">Emails</Button>
			<Button href="/dashboard/availability">Set Availability</Button>
			<form method="POST" action="/auth/logout">
				<Button type="submit" variant="secondary">Logout</Button>
			</form>
		{/snippet}
	</PageHeader>

	<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Profile Section -->
		<ProfileSection user={data.user} />

		<!-- Booking Link -->
		<Card class="bg-accent-subtle border-border-primary mb-8" padding="sm" shadow="none">
			<h2 class="text-lg font-semibold text-foreground mb-2">Your Booking Page</h2>
			<div class="flex items-center gap-2">
				<input
					type="text"
					readonly
					value="{data.appUrl}/"
					class="flex-1 px-3 py-2 bg-surface-2 border border-border-medium rounded-md text-sm text-foreground"
				/>
				<Button
					onclick={() => {
						navigator.clipboard.writeText(data.appUrl + '/');
					}}
				>
					Copy Link
				</Button>
			</div>
		</Card>

		{#if cancelSuccess || rescheduleSuccess}
			<Alert variant="success" class="mb-4 p-3">
				{cancelSuccess || rescheduleSuccess}
			</Alert>
		{/if}

		<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
			<!-- Event Types -->
			<EventTypesList eventTypes={data.eventTypes || []} />

			<!-- Recent Bookings -->
			<BookingsList {bookings} onCancelClick={openCancelModal} onRescheduleClick={openRescheduleModal} />
		</div>
	</main>
</PageShell>

<!-- Cancel Booking Modal -->
<CancelBookingModal
	booking={getBookingById(cancellingBookingId)}
	show={showCancelModal}
	onClose={closeCancelModal}
	onCancel={cancelBooking}
/>

<!-- Host Reschedule Modal -->
<HostRescheduleModal
	booking={getBookingById(reschedulingBookingId)}
	onClose={closeRescheduleModal}
	onSubmit={submitRescheduleProposal}
/>
