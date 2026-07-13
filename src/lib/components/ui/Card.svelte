<script lang="ts">
	import type { Snippet } from 'svelte';

	type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';
	type CardRadius = 'lg' | 'xl' | '2xl';
	type CardShadow = 'none' | 'sm' | 'md' | 'lg';

	interface Props {
		padding?: CardPadding;
		radius?: CardRadius;
		shadow?: CardShadow;
		class?: string;
		children?: Snippet;
		[key: string]: any;
	}

	let {
		padding = 'md',
		radius = 'lg',
		shadow = 'sm',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const paddingClasses: Record<CardPadding, string> = {
		none: '',
		sm: 'p-4',
		md: 'p-6',
		lg: 'p-8',
		xl: 'p-12'
	};

	const radiusClasses: Record<CardRadius, string> = {
		lg: 'rounded-lg',
		xl: 'rounded-xl',
		'2xl': 'rounded-2xl'
	};

	const shadowClasses: Record<CardShadow, string> = {
		none: '',
		sm: 'shadow-sm',
		md: 'shadow-md',
		lg: 'shadow-lg'
	};

	const classes = $derived([
		'bg-surface border border-border',
		paddingClasses[padding],
		radiusClasses[radius],
		shadowClasses[shadow],
		className
	].filter(Boolean).join(' '));
</script>

<div class={classes} {...rest}>
	{@render children?.()}
</div>