<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<div class="text-center {className}">
	<a
		href="https://github.com/dennisklappe/CloudMeet"
		target="_blank"
		rel="noopener noreferrer"
		class="text-xs text-subtle-foreground hover:text-muted-foreground transition"
	>
		Powered by CloudMeet
	</a>
</div>
