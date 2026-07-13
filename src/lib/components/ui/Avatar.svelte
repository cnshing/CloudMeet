<script lang="ts">
	type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

	interface Props {
		src?: string | null;
		name?: string | null;
		alt?: string;
		size?: AvatarSize;
		class?: string;
		fallback?: string;
	}

	let {
		src = null,
		name = null,
		alt,
		size = 'md',
		class: className = '',
		fallback = 'U'
	}: Props = $props();

	const sizeClasses: Record<AvatarSize, string> = {
		sm: 'w-12 h-12 text-lg',
		md: 'w-16 h-16 text-2xl',
		lg: 'w-24 h-24 text-3xl',
		xl: 'w-32 h-32 text-4xl'
	};

	const classes = $derived([
		sizeClasses[size],
		'rounded-full object-cover',
		className
	].filter(Boolean).join(' '));

	const initial = $derived(name?.charAt(0) || fallback);
</script>

{#if src}
	<img src={src} alt={alt || name || 'Profile'} class={classes} />
{:else}
	<div class="{classes} flex items-center justify-center bg-primary text-primary-foreground font-semibold">
		{initial}
	</div>
{/if}