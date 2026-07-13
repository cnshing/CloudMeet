<script lang="ts">
	import type { Snippet } from 'svelte';

	type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'success';
	type ButtonSize = 'sm' | 'md' | 'lg';

	interface Props {
		href?: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		fullWidth?: boolean;
		pill?: boolean;
		disabled?: boolean;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		target?: string;
		rel?: string;
		onclick?: (event: MouseEvent) => void;
		children?: Snippet;
		[key: string]: any;
	}

	let {
		href,
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		pill = false,
		disabled = false,
		type = 'button',
		class: className = '',
		target,
		rel,
		onclick,
		children,
		...rest
	}: Props = $props();

	const baseClasses = 'inline-flex items-center justify-center font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';

	const variantClasses: Record<ButtonVariant, string> = {
		primary: 'bg-primary text-primary-foreground hover:opacity-90 border border-transparent shadow-sm',
		secondary: 'bg-surface-2 text-muted-foreground hover:bg-border-medium border border-transparent',
		ghost: 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-surface-2 border border-transparent',
		outline: 'bg-surface text-muted-foreground hover:bg-surface-2 border border-border',
		danger: 'bg-red-600 text-white hover:bg-red-700 border border-transparent',
		success: 'bg-green-600 text-white hover:bg-green-700 border border-transparent'
	};

	const sizeClasses: Record<ButtonSize, string> = {
		sm: 'px-3 py-1.5 text-sm',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	};

	const classes = $derived([
		baseClasses,
		variantClasses[variant],
		sizeClasses[size],
		pill ? 'rounded-full' : 'rounded-lg',
		fullWidth ? 'w-full' : '',
		className
	].filter(Boolean).join(' '));

	function handleAnchorClick(event: MouseEvent) {
		if (disabled) {
			event.preventDefault();
			return;
		}

		onclick?.(event);
	}
</script>

{#if href}
	<a
		{href}
		{target}
		{rel}
		aria-disabled={disabled}
		class={classes}
		onclick={handleAnchorClick}
		{...rest}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		{type}
		{disabled}
		class={classes}
		{onclick}
		{...rest}
	>
		{@render children?.()}
	</button>
{/if}