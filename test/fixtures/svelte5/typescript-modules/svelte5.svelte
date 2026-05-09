<script lang="ts">
	import { counter, ClassCounter } from './module.svelte.ts';

	let double = $derived(counter.count * 2);
	$effect(() => {
		if (counter.count > 10) {
			console.log('Too high!')
		} else {
			let c = new ClassCounter();
			c.count = counter.count;
		}

	});
</script>

<button onclick={() => counter.count++}>
	{counter.count} / {double}
</button>
