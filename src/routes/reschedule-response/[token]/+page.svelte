<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	import Footer from '$lib/components/Footer.svelte';
	import { Alert, Button, Card, ResultState } from '$lib/components/ui';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const success = $derived($page.url.searchParams.get('success'));
	const action = $derived(data.action);

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

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
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
</script>

<svelte:head>
	<title>Reschedule Response</title>
</svelte:head>

<div class="min-h-screen bg-background flex flex-col items-center justify-center p-4">
	{#if success === 'accepted'}
		<!-- Accepted Success -->
		<ResultState variant="success" title="Meeting Rescheduled!" description="Your meeting has been confirmed for the new time. A calendar update has been sent to your email." class="max-w-md w-full">
			<div class="bg-background rounded-lg p-4 text-left">
				<p class="font-semibold text-foreground mb-2">{data.proposal?.event_name}</p>
				<p class="text-sm text-muted-foreground">{formatDateTime(data.proposal?.proposed_start_time || '')}</p>
			</div>
		</ResultState>
	{:else if success === 'declined'}
		<!-- Declined Success -->
		<ResultState variant="error" title="Meeting Cancelled" description="The meeting has been cancelled. The host has been notified." class="max-w-md w-full">
			{#snippet actions()}
				<Button href="/{data.proposal?.event_slug}" size="lg" class="hover:bg-border-strong">Book a New Time</Button>
			{/snippet}
		</ResultState>
	{:else if data.alreadyResponded}
		<!-- Already Responded -->
		<ResultState variant="warning" title="Already Responded" description="This reschedule request has already been {data.proposal?.status}." class="max-w-md w-full" />
	{:else if action === 'counter'}
		<!-- Counter Propose - Redirect to reschedule page -->
		<Card padding="lg" radius="2xl" shadow="lg" class="max-w-md w-full text-center">
			<h1 class="text-2xl font-semibold text-foreground mb-4">Propose Different Time</h1>
			<p class="text-muted-foreground mb-6">You'll be redirected to choose a different time for your meeting.</p>
			<Button href="/reschedule/{data.proposal?.booking_id}" size="lg" class="hover:bg-border-strong">Choose Different Time</Button>
		</Card>
	{:else}
		<!-- Response Form -->
		<Card padding="lg" radius="2xl" shadow="lg" class="max-w-lg w-full">
			<h1 class="text-2xl font-semibold text-foreground mb-2 text-center">Reschedule Request</h1>
			<p class="text-muted-foreground mb-6 text-center">
				<strong>{data.proposal?.host_name}</strong> would like to reschedule your meeting.
			</p>

			{#if form?.error}
				<Alert variant="error" class="mb-6">
					{form.error}
				</Alert>
			{/if}

			{#if data.proposal?.message}
				<div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
					<p class="text-sm text-amber-800">{data.proposal.message}</p>
				</div>
			{/if}

			<div class="space-y-4 mb-6">
				<!-- Original Time -->
				<div class="bg-red-50 border border-red-200 rounded-lg p-4">
					<div class="text-xs font-semibold text-red-700 uppercase mb-2">Original Time</div>
					<div class="text-foreground line-through">
						<p class="font-medium">{formatDate(data.proposal?.original_start_time || '')}</p>
						<p class="text-sm">{formatTime(data.proposal?.original_start_time || '')} - {formatTime(data.proposal?.original_end_time || '')}</p>
					</div>
				</div>

				<!-- Proposed New Time -->
				<div class="bg-green-50 border border-green-200 rounded-lg p-4">
					<div class="text-xs font-semibold text-green-700 uppercase mb-2">Proposed New Time</div>
					<div class="text-foreground">
						<p class="font-medium">{formatDate(data.proposal?.proposed_start_time || '')}</p>
						<p class="text-sm">{formatTime(data.proposal?.proposed_start_time || '')} - {formatTime(data.proposal?.proposed_end_time || '')}</p>
					</div>
				</div>
			</div>

			<div class="bg-background rounded-lg p-4 mb-6 border border-border">
				<p class="text-sm"><span class="text-muted-foreground">Meeting:</span> <span class="font-medium text-foreground">{data.proposal?.event_name}</span></p>
				<p class="text-sm"><span class="text-muted-foreground">With:</span> <span class="font-medium text-foreground">{data.proposal?.host_name}</span></p>
			</div>

			<div class="space-y-3">
				<form method="POST" action="?/accept" use:enhance>
					<Button
						type="submit"
						variant="success"
						fullWidth
						class="px-6 py-3 font-medium"
					>
						Accept New Time
					</Button>
				</form>

				<form method="POST" action="?/decline" use:enhance>
					<Button
						type="submit"
						variant="danger"
						fullWidth
						class="px-6 py-3 font-medium"
					>
						Decline & Cancel Meeting
					</Button>
				</form>

				<Button
					href="/reschedule/{data.proposal?.booking_id}"
					variant="outline"
					fullWidth
					class="px-6 py-3 font-medium border-2 border-primary text-primary hover:bg-accent-subtle"
				>
					Propose Different Time
				</Button>
			</div>
		</Card>
	{/if}

	<Footer class="mt-6" />
</div>
