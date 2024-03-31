<script>
	let count = $state(0);
	let double = $derived(count * 2);
	$effect(() => {
		if (count > 10) {
			alert('Too high!');
		}

	});
</script>

<button onclick={() => count++}>
	{count} / {double}
</button>
