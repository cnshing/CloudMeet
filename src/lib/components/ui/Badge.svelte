<script lang="ts">
	import type { Snippet } from 'svelte';

	type BadgeVariant = 'success' | 'error' | 'warning' | 'neutral' | 'accent' | 'primary';

	interface Props {
		variant?: BadgeVariant;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	}

	let { variant = 'neutral', class: className = '', children, ...rest }: Props = $props();

	const variantClasses: Record<BadgeVariant, string> = {
		success: 'bg-accent-subtle text-border-strong',
		error: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-200',
		warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-200',
		neutral: 'bg-surface-2 text-muted-foreground',
		accent: 'bg-accent-subtle text-accent',
		primary: 'bg-primary text-primary-foreground'
	};

	const classes = $derived([
		'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
		variantClasses[variant],
		className
	].filter(Boolean).join(' '));
</script>

<span class={classes} {...rest}>
	{@render children?.()}
</span>