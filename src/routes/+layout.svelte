<script lang="ts">
	import '../app.css';
	import { onMount, onDestroy } from 'svelte';
	import { theme } from '$lib/stores/theme';

	let mediaQuery: MediaQueryList | undefined;

	function handleOsThemeChange() {
		// Only react to OS changes when the user preference is 'system'
		theme.refresh();
	}

	onMount(() => {
		// Sync the store with whatever the inline script already applied
		theme.refresh();

		// Listen for OS-level colour-scheme changes so live tab updates work
		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', handleOsThemeChange);
	});

	onDestroy(() => {
		mediaQuery?.removeEventListener('change', handleOsThemeChange);
	});
</script>

<div class="min-h-screen bg-background">
	<slot />
</div>
