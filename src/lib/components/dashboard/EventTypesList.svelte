<script lang="ts">
	import { Badge, Button, Card } from '$lib/components/ui';
	import { SectionHeader } from '$lib/components/layout';

	interface EventType {
		id: string;
		name: string;
		slug: string;
		duration: number;
		description?: string | null;
		is_active: boolean | number;
		is_listed: boolean | number;
	}

	interface Props {
		eventTypes: EventType[];
	}

	let { eventTypes }: Props = $props();
</script>

<div>
	<SectionHeader title="Event Types" class="mb-4">
		{#snippet actions()}
		<Button href="/dashboard/event-types/new">
			+ New Event Type
		</Button>
		{/snippet}
	</SectionHeader>

	<div class="space-y-4">
		{#if eventTypes && eventTypes.length > 0}
			{#each eventTypes as eventType}
				<Card padding="sm">
					<div class="flex justify-between items-start mb-2">
						<div>
							<h3 class="font-semibold text-foreground">{eventType.name}</h3>
							<p class="text-sm text-muted-foreground">{eventType.duration} minutes</p>
						</div>
						<div class="flex flex-wrap justify-end gap-2">
							{#if !eventType.is_listed}
								<Badge variant="warning">
									Unlisted
								</Badge>
							{/if}
							<Badge variant={eventType.is_active ? 'success' : 'neutral'}>
								{eventType.is_active ? 'Active' : 'Inactive'}
							</Badge>
						</div>
					</div>
					{#if eventType.description}
						<p class="text-sm text-muted-foreground mb-3">{eventType.description}</p>
					{/if}
					<div class="flex gap-2">
						<a
							href="/{eventType.slug}"
							target="_blank"
							class="text-sm text-accent hover:text-accent"
						>
							View Page
						</a>
						<span class="text-subtle-foreground">|</span>
						<a
							href="/dashboard/event-types/{eventType.id}"
							class="text-sm text-accent hover:text-accent"
						>
							Edit
						</a>
					</div>
				</Card>
			{/each}
		{:else}
			<Card padding="lg" class="text-center">
				<p class="text-muted-foreground mb-4">No event types yet</p>
				<Button href="/dashboard/event-types/new">
					Create Your First Event Type
				</Button>
			</Card>
		{/if}
	</div>
</div>
