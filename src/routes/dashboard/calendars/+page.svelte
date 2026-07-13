<script lang="ts">
	import type { PageData } from './$types';
	import { CalendarSettings } from '$lib/components/dashboard';
	import { PageHeader, PageShell } from '$lib/components/layout';

	let { data }: { data: PageData } = $props();
</script>

<PageShell>
	<PageHeader
		title="Calendar Settings"
		subtitle="Connect calendars and configure defaults"
		backHref="/dashboard"
		backLabel="Dashboard"
		maxWidth="4xl"
	/>

	<main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<CalendarSettings user={data.user} outlookConfigured={data.outlookConfigured} />
	</main>
</PageShell>
