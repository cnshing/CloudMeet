<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	import Footer from '$lib/components/Footer.svelte';
	import { Alert, Avatar, Button, ResultState } from '$lib/components/ui';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let cancelling = $state(false);
	let reason = $state('');
	const success = $derived($page.url.searchParams.get('success') === 'true');

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(date);
	}

	function formatTime(dateStr: string) {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		}).format(date);
	}

	function formatTimeRange(start: string, end: string) {
		return `${formatTime(start)} - ${formatTime(end)}`;
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

<div class="min-h-screen bg-surface md:bg-background flex flex-col items-center md:justify-center md:p-4">
	{#if success || data.alreadyCanceled}
		<div class="w-full max-w-md px-4 md:px-0">
			<ResultState
				variant="success"
				title="Booking Cancelled"
				description={data.alreadyCanceled ? 'This meeting has already been cancelled.' : 'Your meeting has been cancelled successfully. The host has been notified.'}
				class="w-full rounded-2xl"
			>
				<div class="bg-background rounded-lg p-4 sm:p-6 text-left mb-2">
					<h2 class="font-semibold text-foreground mb-3">{data.booking.event_name}</h2>
					<div class="space-y-3 text-sm">
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
							</svg>
							<div>
								<p class="text-foreground">{formatTimeRange(data.booking.start_time, data.booking.end_time)}</p>
								<p class="text-subtle-foreground">{formatDate(data.booking.start_time)}</p>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
							</svg>
							<div>
								<p class="text-foreground">{data.booking.attendee_name}</p>
								<p class="text-subtle-foreground break-all">{data.booking.attendee_email}</p>
							</div>
						</div>
					</div>
				</div>

				{#snippet actions()}
					<Button href="/{data.booking.event_slug}" size="lg" pill>Book Another Meeting</Button>
				{/snippet}
			</ResultState>
			<Footer class="mt-6" />
		</div>
	{:else}
		<div class="w-full md:w-auto">
			<!-- ════════════════════════════════════════════ MOBILE ════ -->
			<div class="md:hidden min-h-screen w-full bg-surface">
				<div class="px-6 pt-8 pb-6">
					<div class="flex flex-col items-center text-center">
						<Avatar src={data.booking.host_profile_image} name={data.booking.host_name} size="lg" fallback="H" class="border-4 border-surface shadow-lg" />

						<p class="mt-4 text-base font-semibold text-muted-foreground">{data.booking.host_name}</p>
						<h1 class="mt-2 text-2xl font-bold text-foreground">{data.booking.event_name}</h1>
					</div>
				</div>

				<div class="border-b border-border mx-6"></div>

				<div class="px-6 py-6">
					<div class="space-y-4 text-sm text-muted-foreground">
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
							</svg>
							<div>
								<p class="font-medium text-foreground">{formatTimeRange(data.booking.start_time, data.booking.end_time)}</p>
								<p>{formatDate(data.booking.start_time)}</p>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
							</svg>
							<div>
								<p class="font-medium text-foreground">{data.booking.attendee_name}</p>
								<p class="break-all">{data.booking.attendee_email}</p>
							</div>
						</div>
					</div>
				</div>

				<div class="border-b border-border mx-6"></div>

				<div class="px-6 py-8">
					<h2 class="text-lg font-semibold text-foreground mb-2 text-center">Cancel this booking?</h2>
					<p class="text-sm text-subtle-foreground text-center mb-6">
						This will remove the meeting from the calendar and notify {data.booking.host_name}.
					</p>

					{#if form?.error}
						<Alert variant="error" class="p-3 mb-4">Error: {form.error}</Alert>
					{/if}

					<form method="POST" use:enhance={handleSubmit} class="space-y-4">
						<div>
							<label for="mobile-reason" class="block text-sm font-medium text-muted-foreground mb-1.5">Reason for cancellation <span class="font-normal text-subtle-foreground">(optional)</span></label>
							<textarea
								id="mobile-reason"
								name="reason"
								bind:value={reason}
								rows="4"
								class="w-full px-4 py-3 border border-border-medium rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none text-sm"
								style="--tw-ring-color: var(--color-primary)"
								placeholder="Let the host know why you're cancelling..."
							></textarea>
						</div>

						<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<p class="text-sm text-yellow-800"><strong>Heads up:</strong> This action cannot be undone. The host will be notified of the cancellation.</p>
						</div>

						<Button type="submit" disabled={cancelling} variant="danger" fullWidth pill class="py-3 px-6 font-semibold">
							{cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
						</Button>
						<Button href="/{data.booking.event_slug}" variant="secondary" fullWidth pill class="py-3 px-6 font-semibold">
							Keep Booking
						</Button>
					</form>
				</div>

				<Footer class="px-6 pb-8" />
			</div>

			<!-- ════════════════════════════════════════════ DESKTOP ═══ -->
			<div class="hidden md:flex bg-surface border border-border rounded-2xl shadow-lg overflow-hidden w-[760px]">
				<div class="w-72 border-r border-border flex flex-col flex-shrink-0">
					<div class="flex-1 p-6">
						<div class="mb-6">
							<Avatar src={data.booking.host_profile_image} name={data.booking.host_name} size="sm" fallback="H" class="mb-3" />

							<p class="text-sm font-medium text-muted-foreground mb-1">{data.booking.host_name}</p>
							<h1 class="text-2xl font-bold text-foreground">{data.booking.event_name}</h1>
						</div>

						<div class="space-y-4 text-sm text-muted-foreground">
							<div class="flex items-start gap-3">
								<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
								</svg>
								<div>
									<p class="font-medium text-foreground">{formatTimeRange(data.booking.start_time, data.booking.end_time)}</p>
									<p class="text-subtle-foreground">{formatDate(data.booking.start_time)}</p>
								</div>
							</div>
						</div>

						<div class="mt-6 pt-6 border-t border-border">
							<p class="text-xs font-semibold text-subtle-foreground uppercase mb-2">Attendee</p>
							<div class="bg-surface-2 rounded-lg p-3 text-sm">
								<p class="font-medium text-foreground">{data.booking.attendee_name}</p>
								<p class="text-muted-foreground break-all">{data.booking.attendee_email}</p>
							</div>
						</div>
					</div>
				</div>

				<div class="flex-1 p-8">
					<div class="mb-6">
						<h2 class="text-2xl font-semibold text-foreground mb-2">Cancel this booking?</h2>
						<p class="text-sm text-muted-foreground">
							This will cancel your scheduled meeting and notify {data.booking.host_name}.
						</p>
					</div>

					{#if form?.error}
						<Alert variant="error" class="mb-6">Error: {form.error}</Alert>
					{/if}

					<form method="POST" use:enhance={handleSubmit} class="space-y-5">
						<div>
							<label for="reason" class="block text-sm font-medium text-muted-foreground mb-2">Reason for cancellation <span class="font-normal text-subtle-foreground">(optional)</span></label>
							<textarea
								id="reason"
								name="reason"
								bind:value={reason}
								rows="4"
								class="w-full px-4 py-3 border border-border-medium rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none text-sm"
								style="--tw-ring-color: var(--color-primary)"
								placeholder="Let the host know why you're cancelling..."
							></textarea>
						</div>

						<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
							<p class="text-sm text-yellow-800"><strong>Heads up:</strong> This action cannot be undone. The host will be notified of the cancellation.</p>
						</div>

						<div class="flex gap-3">
							<Button type="submit" disabled={cancelling} variant="danger" pill class="flex-1 px-6 py-3 font-semibold">
								{cancelling ? 'Cancelling...' : 'Yes, Cancel Booking'}
							</Button>
							<Button href="/{data.booking.event_slug}" variant="secondary" pill class="flex-1 px-6 py-3 font-semibold">
								Keep Booking
							</Button>
						</div>
					</form>
				</div>
			</div>

			<Footer class="mt-6 hidden md:block" />
		</div>
	{/if}
</div>
