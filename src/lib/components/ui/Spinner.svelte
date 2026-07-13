<script lang="ts">
	type SpinnerSize = 'sm' | 'md' | 'lg';

	interface Props {
		size?: SpinnerSize;
		class?: string;
	}

	let { size = 'md', class: className = '' }: Props = $props();

	const sizeClasses: Record<SpinnerSize, string> = {
		sm: 'h-4 w-4 border-2',
		md: 'h-8 w-8 border-2',
		lg: 'h-10 w-10 border-4'
	};

	const classes = $derived([
		'animate-spin rounded-full border-primary border-t-transparent',
		sizeClasses[size],
		className
	].filter(Boolean).join(' '));
</script>

<div class={classes} aria-label="Loading"></div>