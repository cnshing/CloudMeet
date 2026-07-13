<script lang="ts">
	import type { Snippet } from 'svelte';
	import Card from './Card.svelte';

	type ResultVariant = 'success' | 'error' | 'warning' | 'info';

	interface Props {
		variant?: ResultVariant;
		title: string;
		description?: string;
		class?: string;
		icon?: Snippet;
		actions?: Snippet;
		children?: Snippet;
	}

	let {
		variant = 'info',
		title,
		description,
		class: className = '',
		icon,
		actions,
		children
	}: Props = $props();

	const iconCircleClasses: Record<ResultVariant, string> = {
		success: 'bg-accent-subtle text-accent',
		error: 'bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-200',
		warning: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-950/60 dark:text-yellow-200',
		info: 'bg-accent-subtle text-accent'
	};
</script>

<Card padding="lg" shadow="lg" class="text-center {className}">
	<div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 {iconCircleClasses[variant]}">
		{#if icon}
			{@render icon()}
		{:else if variant === 'error'}
			<svg class="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
			</svg>
		{:else if variant === 'warning'}
			<svg class="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
			</svg>
		{:else}
			<svg class="w-8 h-8 sm:w-10 sm:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
			</svg>
		{/if}
	</div>

	<h1 class="text-xl sm:text-2xl font-semibold text-foreground mb-2">{title}</h1>
	{#if description}
		<p class="text-sm sm:text-base text-muted-foreground mb-6">{description}</p>
	{/if}

	{@render children?.()}

	{#if actions}
		<div class="mt-6">
			{@render actions()}
		</div>
	{/if}
</Card>