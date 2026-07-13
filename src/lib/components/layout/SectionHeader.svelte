<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		subtitle?: string;
		class?: string;
		actions?: Snippet;
	}

	let { title, subtitle, class: className = '', actions }: Props = $props();
</script>

<div class="flex items-start justify-between gap-4 {className}">
	<div>
		<h2 class="text-xl font-bold text-foreground">{title}</h2>
		{#if subtitle}
			<p class="text-sm text-muted-foreground mt-1">{subtitle}</p>
		{/if}
	</div>

	{#if actions}
		<div class="flex flex-wrap gap-2 justify-end">
			{@render actions()}
		</div>
	{/if}
</div>