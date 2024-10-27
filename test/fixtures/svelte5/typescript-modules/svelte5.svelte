<script>
	import { counter } from './module.svelte';

	let double = $derived(counter.count * 2);
	$effect(() => {
		if (count > 10) {
			alert('Too high!');
		}

	});
</script>

<button onclick={() => count++}>
	{count} / {double}
</button>
