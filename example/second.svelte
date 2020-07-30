<script>
  import { onMount } from "svelte";

  let test;

  onMount(() => {
    console.log("the component has mounted");
    test.value = "Coolio";
  });
</script>

<input type="text" bind:this={test} />
