<script lang="ts">
	import { Alert, Button, FormField } from '$lib/components/ui';

	interface Props {
		bookingForm: {
			name: string;
			email: string;
			notes: string;
		};
		bookingStatus: 'idle' | 'submitting' | 'success' | 'error';
		bookingError: string;
		onSubmit: (e: Event) => void;
	}

	let {
		bookingForm = $bindable(),
		bookingStatus,
		bookingError,
		onSubmit
	}: Props = $props();
</script>

<div class="max-w-md">
	<h2 class="text-xl font-semibold text-foreground mb-6">Enter Details</h2>

	{#if bookingError}
		<Alert variant="error" class="mb-6">
			{bookingError}
		</Alert>
	{/if}

	<form onsubmit={onSubmit} class="space-y-5">
		<FormField forId="name" label="Name" required>
			<input
				type="text"
				id="name"
				bind:value={bookingForm.name}
				required
				class="w-full px-4 py-3 border border-border-medium rounded-lg focus:ring-2 focus:border-transparent outline-none"
				style="--tw-ring-color: var(--color-primary)"
			/>
		</FormField>
		<FormField forId="email" label="Email" required>
			<input
				type="email"
				id="email"
				bind:value={bookingForm.email}
				required
				class="w-full px-4 py-3 border border-border-medium rounded-lg focus:ring-2 focus:border-transparent outline-none"
				style="--tw-ring-color: var(--color-primary)"
			/>
		</FormField>
		<FormField forId="notes" label="Please share anything that will help prepare for our meeting.">
			<textarea
				id="notes"
				bind:value={bookingForm.notes}
				rows="4"
				class="w-full px-4 py-3 border border-border-medium rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none"
				style="--tw-ring-color: var(--color-primary)"
			></textarea>
		</FormField>
		<Button
			type="submit"
			disabled={bookingStatus === 'submitting'}
			fullWidth
			pill
			class="py-3 px-6 font-semibold hover:bg-border-strong"
		>
			{bookingStatus === 'submitting' ? 'Scheduling...' : 'Schedule Event'}
		</Button>
	</form>
</div>
