<script lang="ts">
	interface EventType {
		id: string;
		name: string;
		slug: string;
		duration: number;
		description?: string | null;
		is_active: boolean;
	}

	interface Props {
		eventTypes: EventType[];
	}

	let { eventTypes }: Props = $props();
</script>

<div>
	<div class="flex justify-between items-center mb-4">
		<h2 class="text-xl font-bold text-foreground">Event Types</h2>
		<a
			href="/dashboard/event-types/new"
			class="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition text-sm"
		>
			+ New Event Type
		</a>
	</div>

	<div class="space-y-4">
		{#if eventTypes && eventTypes.length > 0}
			{#each eventTypes as eventType}
				<div class="bg-surface rounded-lg shadow-sm p-4 border border-border">
					<div class="flex justify-between items-start mb-2">
						<div>
							<h3 class="font-semibold text-foreground">{eventType.name}</h3>
							<p class="text-sm text-muted-foreground">{eventType.duration} minutes</p>
						</div>
						<span
							class="px-2 py-1 text-xs rounded-full {eventType.is_active
								? 'bg-green-100 text-green-800'
								: 'bg-surface-2 text-muted-foreground'}"
						>
							{eventType.is_active ? 'Active' : 'Inactive'}
						</span>
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
				</div>
			{/each}
		{:else}
			<div class="bg-surface rounded-lg shadow-sm p-8 text-center border border-border">
				<p class="text-muted-foreground mb-4">No event types yet</p>
				<a
					href="/dashboard/event-types/new"
					class="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
				>
					Create Your First Event Type
				</a>
			</div>
		{/if}
	</div>
</div>
