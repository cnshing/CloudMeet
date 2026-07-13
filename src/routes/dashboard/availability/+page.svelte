<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import TimezoneSelector from '$lib/components/TimezoneSelector.svelte';
	import { Alert, Button, Card } from '$lib/components/ui';
	import { PageHeader, PageShell } from '$lib/components/layout';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const daysOfWeek = [
		{ id: 0, name: 'Sunday' },
		{ id: 1, name: 'Monday' },
		{ id: 2, name: 'Tuesday' },
		{ id: 3, name: 'Wednesday' },
		{ id: 4, name: 'Thursday' },
		{ id: 5, name: 'Friday' },
		{ id: 6, name: 'Saturday' }
	];

	// Initialize availability state from loaded data
	let availability = $state(
		daysOfWeek.map((day) => {
			const existingRules = data.rules?.filter((r) => r.day_of_week === day.id) || [];
			return {
				day: day.id,
				name: day.name,
				enabled: existingRules.length > 0,
				startTime: existingRules[0]?.start_time || '09:00',
				endTime: existingRules[0]?.end_time || '17:00'
			};
		})
	);

	let saving = $state(false);
	let showSuccess = $state(false);
	let selectedTimezone = $state(data.timezone || 'UTC');
	let showTimezoneDropdown = $state(false);

	// Timezone label helper
	const timezoneLabels: Record<string, string> = {
		'America/Los_Angeles': 'Pacific Time',
		'America/Denver': 'Mountain Time',
		'America/Chicago': 'Central Time',
		'America/New_York': 'Eastern Time',
		'Europe/London': 'UK, Ireland Time',
		'Europe/Paris': 'Central European Time',
		'Europe/Amsterdam': 'Amsterdam Time',
		'Europe/Berlin': 'Berlin Time',
		'Asia/Tokyo': 'Japan Time',
		'Asia/Shanghai': 'China Time',
		'Australia/Sydney': 'Sydney Time',
		'UTC': 'UTC Time'
	};

	function getTimezoneLabel(tz: string): string {
		return timezoneLabels[tz] || tz.replace(/_/g, ' ').split('/').pop() || tz;
	}

	function getCurrentTime(tz: string): string {
		try {
			return new Intl.DateTimeFormat('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true,
				timeZone: tz
			}).format(new Date());
		} catch {
			return '--:--';
		}
	}

	function handleSubmit() {
		saving = true;
		showSuccess = false;
		return async ({ update, result }: any) => {
			// Update to get the form action result, but don't reload the page data
			await update({ reset: false });
			saving = false;

			// Show success message if save was successful
			if (result.type === 'success' && result.data?.success) {
				showSuccess = true;
				// Hide success message after 3 seconds
				setTimeout(() => {
					showSuccess = false;
				}, 3000);
			}
		};
	}
</script>

<PageShell>
	<PageHeader title="Set Availability" backHref="/dashboard" backLabel="Dashboard" />

	<main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if showSuccess}
			<Alert variant="success" class="mb-6">
				✓ Availability saved successfully!
			</Alert>
		{/if}

		{#if form?.error}
			<Alert variant="error" class="mb-6">
				Error: {form.error}
			</Alert>
		{/if}

		<!-- Timezone Selection -->
		<Card class="mb-6">
			<h2 class="text-lg font-semibold text-foreground mb-4">Your Timezone</h2>
			<p class="text-sm text-muted-foreground mb-4">
				Set your timezone so that your availability is shown correctly to people booking meetings.
			</p>
			<div class="relative">
				<button
					type="button"
					onclick={() => showTimezoneDropdown = !showTimezoneDropdown}
					class="flex items-center gap-3 px-4 py-3 border border-border-medium rounded-lg hover:border-border-strong transition w-full sm:w-auto"
				>
					<svg class="w-5 h-5 text-subtle-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
					<div class="text-left">
						<div class="font-medium text-foreground">{getTimezoneLabel(selectedTimezone)}</div>
						<div class="text-sm text-subtle-foreground">{selectedTimezone} ({getCurrentTime(selectedTimezone)})</div>
					</div>
					<svg class="w-5 h-5 text-subtle-foreground ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
					</svg>
				</button>
				{#if showTimezoneDropdown}
					<TimezoneSelector
						{selectedTimezone}
						onSelect={(tz) => selectedTimezone = tz}
						onClose={() => showTimezoneDropdown = false}
					/>
				{/if}
			</div>
		</Card>

		<Card class="mb-6">
			<h2 class="text-lg font-semibold text-foreground mb-4">Weekly Schedule</h2>
			<p class="text-sm text-muted-foreground mb-6">
				Set your available hours for each day of the week. People can only book meetings during these times.
			</p>

			<form method="POST" action="?/save" use:enhance={handleSubmit}>
				<input type="hidden" name="rules" value={JSON.stringify(availability)} />
				<input type="hidden" name="timezone" value={selectedTimezone} />

				<div class="space-y-4">
					{#each availability as day}
						<div class="flex items-center gap-4 p-4 border border-border rounded-lg">
							<div class="flex items-center min-w-[120px]">
								<input
									type="checkbox"
									bind:checked={day.enabled}
									class="h-4 w-4 text-primary rounded border-border-medium"
									id="day-{day.day}"
								/>
								<label for="day-{day.day}" class="ml-2 font-medium text-foreground">
									{day.name}
								</label>
							</div>
							{#if day.enabled}
								<div class="flex items-center gap-2 flex-1">
									<input type="time" bind:value={day.startTime} class="px-3 py-2 border border-border-medium rounded-md text-sm" />
									<span class="text-muted-foreground">to</span>
									<input type="time" bind:value={day.endTime} class="px-3 py-2 border border-border-medium rounded-md text-sm" />
								</div>
							{:else}
								<span class="text-subtle-foreground text-sm">Unavailable</span>
							{/if}
						</div>
					{/each}
				</div>

				<div class="mt-6 flex gap-4">
					<Button
						type="submit"
						disabled={saving}
					>
						{saving ? 'Saving...' : 'Save Availability'}
					</Button>
					<Button
						type="button"
						onclick={() => {
							availability = availability.map((day) => ({
								...day, enabled: day.day >= 1 && day.day <= 5, startTime: '09:00', endTime: '17:00'
							}));
						}}
						variant="outline"
					>
						Set Default Hours (Mon-Fri, 9-5)
					</Button>
				</div>
			</form>
		</Card>

		<Card padding="sm" shadow="none" class="bg-accent-subtle border-border-primary">
			<h3 class="font-semibold text-foreground mb-2">Note</h3>
			<p class="text-sm text-muted-foreground">
				Your connected calendars will also be checked for conflicts. Even if you're available according to these hours,
				if you have an event on your calendar during a time slot, it won't be shown as available to book.
			</p>
		</Card>
	</main>
</PageShell>
