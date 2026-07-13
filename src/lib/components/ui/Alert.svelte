<script lang="ts">
	import type { Snippet } from 'svelte';

	type AlertVariant = 'success' | 'error' | 'warning' | 'info';

	interface Props {
		variant?: AlertVariant;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	}

	let { variant = 'info', class: className = '', children, ...rest }: Props = $props();

	const variantClasses: Record<AlertVariant, string> = {
		success: 'bg-accent-subtle border-border-strong text-foreground',
		error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-900 dark:text-red-200',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/40 dark:border-yellow-900 dark:text-yellow-200',
		info: 'bg-accent-subtle border-border-primary text-foreground'
	};

	const classes = $derived([
		'rounded-lg border p-4 text-sm',
		variantClasses[variant],
		className
	].filter(Boolean).join(' '));
</script>

<div class={classes} role={variant === 'error' ? 'alert' : 'status'} {...rest}>
	{@render children?.()}
</div>