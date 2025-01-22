<script lang="ts">
	import { counter } from './module.svelte.ts';

	let double = $derived(counter.count * 2);
	$effect(() => {
		if (counter.count > 10) {
			console.log('Too high!')
		}

	});
</script>

<button onclick={() => counter.count++}>
	{counter.count} / {double}
</button>
