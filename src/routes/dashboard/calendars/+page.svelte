<script lang="ts">
	import type { PageData } from './$types';
	import { CalendarSettings } from '$lib/components/dashboard';

	let { data }: { data: PageData } = $props();
</script>

<div class="min-h-screen bg-background">
	<!-- Header -->
	<header class="bg-surface shadow-sm">
		<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex items-center gap-4">
				<a href="/dashboard" class="text-subtle-foreground hover:text-muted-foreground">
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
					</svg>
				</a>
				<div>
					<h1 class="text-2xl font-bold text-foreground">Calendar Settings</h1>
					<p class="text-sm text-muted-foreground">Connect calendars and configure defaults</p>
				</div>
			</div>
		</div>
	</header>

	<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<CalendarSettings user={data.user} outlookConfigured={data.outlookConfigured} />
	</main>
</div>
