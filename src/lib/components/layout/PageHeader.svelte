<script lang="ts">
	import type { Snippet } from 'svelte';

	type MaxWidth = '3xl' | '4xl' | '7xl';

	interface Props {
		title: string;
		subtitle?: string;
		backHref?: string;
		backLabel?: string;
		maxWidth?: MaxWidth;
		class?: string;
		actions?: Snippet;
	}

	let {
		title,
		subtitle,
		backHref,
		backLabel = 'Back',
		maxWidth = '7xl',
		class: className = '',
		actions
	}: Props = $props();

	const maxWidthClasses: Record<MaxWidth, string> = {
		'3xl': 'max-w-3xl',
		'4xl': 'max-w-4xl',
		'7xl': 'max-w-7xl'
	};
</script>

<header class="bg-surface shadow-sm {className}">
	<div class="{maxWidthClasses[maxWidth]} mx-auto px-4 sm:px-6 lg:px-8 py-4">
		<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex items-center gap-4">
				{#if backHref}
					<a href={backHref} class="inline-flex items-center gap-2 text-sm text-subtle-foreground hover:text-muted-foreground transition" aria-label={backLabel}>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
						</svg>
						<span class="hidden sm:inline">{backLabel}</span>
					</a>
				{/if}

				<div>
					<h1 class="text-2xl font-bold text-foreground">{title}</h1>
					{#if subtitle}
						<p class="text-sm text-muted-foreground">{subtitle}</p>
					{/if}
				</div>
			</div>

			{#if actions}
				<div class="flex flex-wrap gap-2 sm:justify-end">
					{@render actions()}
				</div>
			{/if}
		</div>
	</div>
</header>