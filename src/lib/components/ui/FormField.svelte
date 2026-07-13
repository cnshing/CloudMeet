<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		label?: string;
		forId?: string;
		help?: string;
		error?: string;
		required?: boolean;
		class?: string;
		children?: Snippet;
	}

	let {
		label,
		forId,
		help,
		error,
		required = false,
		class: className = '',
		children
	}: Props = $props();
</script>

<div class={className}>
	{#if label}
		<label for={forId} class="block text-sm font-medium text-muted-foreground mb-2">
			{label}{required ? ' *' : ''}
		</label>
	{/if}

	{@render children?.()}

	{#if error}
		<p class="text-xs text-red-600 mt-1">{error}</p>
	{:else if help}
		<p class="text-xs text-subtle-foreground mt-1">{help}</p>
	{/if}
</div>