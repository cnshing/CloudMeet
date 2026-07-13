<script lang="ts">
	import { createFormatters } from '$lib/utils/dateFormatters';
	import { Alert, Button, Card, FormField } from '$lib/components/ui';

	interface Booking {
		id: string;
		event_type_name: string;
		attendee_name: string;
		attendee_email: string;
		start_time: string;
		status: string;
	}

	interface Props {
		booking: Booking | null;
		show: boolean;
		onClose: () => void;
		onCancel: (message: string) => Promise<void>;
	}

	let { booking, show, onClose, onCancel }: Props = $props();

	let cancelMessage = $state('');
	let cancelError = $state('');
	let cancelling = $state(false);

	const { formatCompactDateTime } = createFormatters();

	async function handleCancel() {
		if (!booking) return;

		cancelling = true;
		cancelError = '';

		try {
			await onCancel(cancelMessage.trim() || '');
			cancelMessage = '';
			cancelError = '';
		} catch (err: any) {
			cancelError = err.message || 'Failed to cancel booking';
		} finally {
			cancelling = false;
		}
	}

	function handleClose() {
		cancelMessage = '';
		cancelError = '';
		onClose();
	}
</script>

{#if show && booking}
	<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
		<Card padding="none" shadow="lg" class="max-w-md w-full">
			<div class="p-6">
				<h3 class="text-lg font-semibold text-foreground mb-2">Cancel Booking</h3>
				<p class="text-sm text-muted-foreground mb-4">
					Cancel <strong>{booking.event_type_name}</strong> with <strong>{booking.attendee_name}</strong> on {formatCompactDateTime(new Date(booking.start_time))}?
				</p>

				{#if cancelError}
					<Alert variant="error" class="p-3 mb-4">
						{cancelError}
					</Alert>
				{/if}

				<FormField
					forId="cancel-message"
					label="Message to attendee (optional)"
					help="This message will be included in the cancellation email"
					class="mb-4"
				>
					<textarea
						id="cancel-message"
						bind:value={cancelMessage}
						placeholder="Let them know why you're cancelling..."
						rows="3"
						class="w-full px-3 py-2 border border-border-medium rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
					></textarea>
				</FormField>

				<div class="flex justify-end gap-3">
					<Button
						onclick={handleClose}
						variant="ghost"
					>
						Keep Booking
					</Button>
					<Button
						onclick={handleCancel}
						disabled={cancelling}
						variant="danger"
					>
						{cancelling ? 'Cancelling...' : 'Cancel Booking'}
					</Button>
				</div>
			</div>
		</Card>
	</div>
{/if}
