<script lang="ts">
	let { class: className = '' }: { class?: string } = $props();
</script>

<div class="flex flex-wrap justify-center divide-x divide-subtle-foreground/30 text-center {className}">
	<a
		target="_blank"
		rel="noopener noreferrer"
		href="tel:+19259674634"
		class="px-3 text-xs text-subtle-foreground hover:text-muted-foreground transition"
	>
		+19259674634
	</a>
	<a
		target="_blank"
		rel="noopener noreferrer"
		href="https://www.openstreetmap.org/search?query=San%20Ramon%2C%20CA"
		class="px-3 text-xs text-subtle-foreground hover:text-muted-foreground transition"
	>
		San Ramon, CA
	</a>
	<a
		target="_blank"
		rel="noopener noreferrer"
		href="mailto:me@chansh.ing"
		class="px-3 text-xs text-subtle-foreground hover:text-muted-foreground transition"
	>
		me@chansh.ing
	</a>
	<a
		target="_blank"
		rel="noopener noreferrer"
		href="https://github.com/cnshing"
		class="px-3 text-xs text-subtle-foreground hover:text-muted-foreground transition"
	>
		https://github.com/cnshing
	</a>
	<a
		target="_blank"
		rel="noopener noreferrer"
		href="https://linkedin.com/in/shing-chan"
		class="px-3 text-xs text-subtle-foreground hover:text-muted-foreground transition"
	>
		https://linkedin.com/in/shing-chan
	</a>
</div>
