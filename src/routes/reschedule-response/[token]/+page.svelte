<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { PageData, ActionData } from './$types';
	import Footer from '$lib/components/Footer.svelte';
	import { Alert, Avatar, Button, Card, ResultState } from '$lib/components/ui';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const success = $derived($page.url.searchParams.get('success'));
	const action = $derived(data.action);

	function formatDate(dateStr?: string | null) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(date);
	}

	function formatTime(dateStr?: string | null) {
		if (!dateStr) return '';
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		}).format(date);
	}

	function formatTimeRange(start?: string | null, end?: string | null) {
		if (!start || !end) return '';
		return `${formatTime(start)} - ${formatTime(end)}`;
	}

	function formatStatus(status?: string | null) {
		if (!status) return 'responded to';
		return status.replace(/_/g, ' ');
	}
</script>

<svelte:head>
	<title>Reschedule Response</title>
</svelte:head>

<div class="min-h-screen bg-surface md:bg-background flex flex-col items-center md:justify-center md:p-4">
	{#if success === 'accepted'}
		<!-- Accepted Success -->
		<div class="w-full max-w-md px-4 md:px-0">
			<ResultState variant="success" title="Great, see you at the new time!" description="Your meeting has been confirmed for the new time, and a calendar update has been sent to your email." class="w-full rounded-2xl">
				<div class="bg-surface-2 rounded-lg p-4 sm:p-6 text-left mb-2">
					<h2 class="font-semibold text-foreground mb-3">{data.proposal?.event_name}</h2>
					<div class="space-y-3 text-sm">
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
							</svg>
							<div>
								<p class="text-foreground">{formatTimeRange(data.proposal?.proposed_start_time, data.proposal?.proposed_end_time)}</p>
								<p class="text-subtle-foreground">{formatDate(data.proposal?.proposed_start_time)}</p>
							</div>
						</div>
						<div class="flex items-start gap-3">
							<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
							</svg>
							<div>
								<p class="text-foreground">{data.proposal?.host_name}</p>
								<p class="text-subtle-foreground">Host</p>
							</div>
						</div>
					</div>
				</div>
			</ResultState>
			<Footer class="mt-6" />
		</div>
	{:else if success === 'declined'}
		<!-- Declined Success -->
		<div class="w-full max-w-md px-4 md:px-0">
			<ResultState variant="error" title="I'm sorry it didn't work out!" description="No worries — the meeting has been cancelled. Feel free to book a new time whenever works for you." class="w-full rounded-2xl">
				<div class="bg-surface-2 rounded-lg p-4 sm:p-6 text-left mb-2">
					<h2 class="font-semibold text-foreground mb-3">{data.proposal?.event_name}</h2>
					<div class="flex items-start gap-3 text-sm">
						<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
						</svg>
						<div>
							<p class="text-foreground line-through">{formatTimeRange(data.proposal?.original_start_time, data.proposal?.original_end_time)}</p>
							<p class="text-subtle-foreground">{formatDate(data.proposal?.original_start_time)}</p>
						</div>
					</div>
				</div>

				{#snippet actions()}
					<Button href="/{data.proposal?.event_slug}" size="lg" pill>Book a New Time</Button>
				{/snippet}
			</ResultState>
			<Footer class="mt-6" />
		</div>
	{:else if data.alreadyResponded}
		<!-- Already Responded -->
		<div class="w-full max-w-md px-4 md:px-0">
			<ResultState variant="warning" title="Already Responded" description="This reschedule request has already been {formatStatus(data.proposal?.status)}." class="w-full rounded-2xl">
				<div class="bg-surface-2 rounded-lg p-4 sm:p-6 text-left mb-2">
					<h2 class="font-semibold text-foreground mb-3">{data.proposal?.event_name}</h2>
					<p class="text-sm text-muted-foreground">With {data.proposal?.host_name}</p>
				</div>
			</ResultState>
			<Footer class="mt-6" />
		</div>
	{:else if action === 'counter'}
		<!-- Counter Propose - Redirect to reschedule page -->
		<div class="w-full max-w-md px-4 md:px-0">
			<Card padding="lg" radius="2xl" shadow="lg" class="w-full text-center">
				<div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent-subtle text-accent flex items-center justify-center mx-auto mb-4 sm:mb-6">
					<svg class="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
					</svg>
				</div>
				<h1 class="text-xl sm:text-2xl font-semibold text-foreground mb-2">Let's find a better time!</h1>
				<p class="text-sm sm:text-base text-muted-foreground mb-6">I understand the new time doesn't work, so let's pick whatever works best for you.</p>
				<div class="bg-surface-2 rounded-lg p-4 sm:p-6 text-left mb-6">
					<h2 class="font-semibold text-foreground mb-1">{data.proposal?.event_name}</h2>
					<p class="text-sm text-muted-foreground">With {data.proposal?.host_name}</p>
				</div>
				<Button href="/reschedule/{data.proposal?.booking_id}" size="lg" pill>Choose Different Time</Button>
			</Card>
			<Footer class="mt-6" />
		</div>
	{:else}
		<!-- Response Form -->
		<div class="w-full md:w-auto">
			<div class="bg-surface md:border md:border-border md:rounded-2xl md:shadow-lg overflow-hidden w-full md:w-[760px] min-h-screen md:min-h-0 md:flex">
				<div class="md:w-72 md:border-r md:border-border flex flex-col flex-shrink-0">
					<div class="flex-1 p-6 md:p-6">
						<div class="flex flex-col items-center text-center md:items-start md:text-left mb-6">
							<Avatar src={data.proposal?.host_profile_image} name={data.proposal?.host_name} size="sm" fallback="H" class="mb-3" />

							<p class="text-sm font-medium text-muted-foreground mb-1">{data.proposal?.host_name}</p>
							<h1 class="text-2xl font-bold text-foreground">{data.proposal?.event_name}</h1>
						</div>

						<div class="space-y-4 text-sm text-muted-foreground">
							<div class="flex items-start gap-3">
								<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
								</svg>
								<span>{data.proposal?.duration_minutes} min</span>
							</div>
							<div class="flex items-start gap-3">
								<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
								</svg>
								<div>
									<p class="font-medium text-foreground">{data.proposal?.attendee_name}</p>
									<p class="text-subtle-foreground break-all">{data.proposal?.attendee_email}</p>
								</div>
							</div>
						</div>

						{#if data.proposal?.message}
							<div class="mt-6 pt-6 border-t border-border">
								<p class="text-xs font-semibold text-subtle-foreground uppercase mb-2">Message from host</p>
								<div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
									{data.proposal.message}
								</div>
							</div>
						{/if}
					</div>
				</div>

				<div class="border-t border-border md:hidden"></div>

				<div class="flex-1 p-6 md:p-8">
					<div class="mb-6 text-center md:text-left">
						<p class="text-sm font-semibold text-primary mb-2">Reschedule request</p>
						<h2 class="text-2xl font-semibold text-foreground mb-2">Review the new time</h2>
						<p class="text-sm text-muted-foreground">
							{data.proposal?.host_name} would like to move your meeting to a different time.
						</p>
					</div>

					{#if form?.error}
						<Alert variant="error" class="mb-6">
							{form.error}
						</Alert>
					{/if}

					<div class="bg-surface-2 rounded-xl border border-border overflow-hidden mb-6">
						<div class="p-4 border-b border-border">
							<p class="text-xs font-semibold text-subtle-foreground uppercase mb-3">Original time</p>
							<div class="flex items-start gap-3 text-sm opacity-70">
								<svg class="w-5 h-5 text-subtle-foreground mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
								</svg>
								<div class="line-through decoration-red-400 decoration-2">
									<p class="font-medium text-foreground">{formatTimeRange(data.proposal?.original_start_time, data.proposal?.original_end_time)}</p>
									<p class="text-muted-foreground">{formatDate(data.proposal?.original_start_time)}</p>
								</div>
							</div>
						</div>

						<div class="p-4 bg-accent-subtle/60">
							<p class="text-xs font-semibold text-accent uppercase mb-3">Proposed new time</p>
							<div class="flex items-start gap-3 text-sm">
								<svg class="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
								</svg>
								<div>
									<p class="font-semibold text-foreground">{formatTimeRange(data.proposal?.proposed_start_time, data.proposal?.proposed_end_time)}</p>
									<p class="text-muted-foreground">{formatDate(data.proposal?.proposed_start_time)}</p>
								</div>
							</div>
						</div>
					</div>

					<div class="space-y-3">
						<form method="POST" action="?/accept" use:enhance>
							<Button type="submit" variant="success" fullWidth pill class="px-6 py-3 font-semibold">
								Accept New Time
							</Button>
						</form>

						<Button
							href="/reschedule/{data.proposal?.booking_id}"
							variant="outline"
							fullWidth
							pill
							class="px-6 py-3 font-semibold border-2 border-primary text-primary hover:bg-accent-subtle"
						>
							Propose Different Time
						</Button>

						<form method="POST" action="?/decline" use:enhance>
							<Button type="submit" variant="ghost" fullWidth pill class="px-6 py-3 font-semibold text-red-600 hover:text-red-700 hover:bg-red-50">
								Decline & Cancel Meeting
							</Button>
						</form>
					</div>
				</div>
			</div>

			<Footer class="mt-6 hidden md:block" />
		</div>
	{/if}
</div>
