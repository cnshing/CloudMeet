<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	import Footer from '$lib/components/Footer.svelte';
	import { Alert, Button, Card, ResultState } from '$lib/components/ui';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let cancelling = $state(false);
	let reason = $state('');
	const success = $derived($page.url.searchParams.get('success') === 'true');

	function formatDateTime(dateStr: string) {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		}).format(date);
	}

	function handleSubmit() {
		cancelling = true;
		return async ({ update }: any) => {
			await update();
			cancelling = false;
		};
	}
</script>

<svelte:head>
	<title>Cancel Booking</title>
</svelte:head>

<div class="min-h-screen bg-background py-12">
	<div class="max-w-2xl mx-auto px-4">
		{#if success || data.alreadyCanceled}
			<!-- Success Message -->
			<ResultState
				variant="success"
				title="Booking Cancelled"
				description="Your meeting has been cancelled successfully. The host has been notified."
			>
				{#snippet actions()}
					<Button href="/{data.booking.event_slug}" size="lg">Book Another Meeting</Button>
				{/snippet}
			</ResultState>
		{:else}
			<!-- Cancellation Form -->
			<Card padding="lg" shadow="lg">
				<h1 class="text-2xl font-bold text-foreground mb-6">Cancel Booking</h1>

				{#if form?.error}
					<Alert variant="error" class="mb-6">Error: {form.error}</Alert>
				{/if}

				<div class="bg-surface-2 border border-border rounded-lg p-6 mb-6">
					<h2 class="font-semibold text-foreground mb-4">Booking Details</h2>
					<div class="space-y-2 text-sm">
						<div><span class="text-muted-foreground">Event:</span><span class="ml-2 text-foreground font-medium">{data.booking.event_name}</span></div>
						<div><span class="text-muted-foreground">With:</span><span class="ml-2 text-foreground font-medium">{data.booking.host_name}</span></div>
						<div><span class="text-muted-foreground">Time:</span><span class="ml-2 text-foreground font-medium">{formatDateTime(data.booking.start_time)}</span></div>
						<div><span class="text-muted-foreground">Attendee:</span><span class="ml-2 text-foreground font-medium">{data.booking.attendee_name}</span></div>
					</div>
				</div>

				<div class="mb-6">
					<label for="reason" class="block text-sm font-medium text-muted-foreground mb-2">Reason for cancellation (optional)</label>
					<textarea id="reason" name="reason" bind:value={reason} rows="3"
						class="w-full px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
						placeholder="Let the host know why you're cancelling..."></textarea>
				</div>

				<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
					<p class="text-sm text-yellow-800"><strong>Warning:</strong> This action cannot be undone. The host will be notified of the cancellation.</p>
				</div>

				<form method="POST" use:enhance={handleSubmit}>
					<input type="hidden" name="reason" value={reason} />
					<div class="flex gap-4">
						<Button
							type="submit"
							disabled={cancelling}
							variant="danger"
							class="flex-1 px-6 py-3 font-medium"
						>
							{cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
						</Button>
						<Button href="/{data.booking.event_slug}" variant="secondary" class="flex-1 px-6 py-3 font-medium">
							Keep Booking
						</Button>
					</div>
				</form>
			</Card>
		{/if}

		<Footer class="mt-6" />
	</div>
</div>
