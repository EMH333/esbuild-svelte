<script>
  import { onMount } from "svelte";

  let test;

  onMount(() => {
    console.log("the second component has mounted");
    test.value = "This is from the second component (components can be imported and they are bundled, yay)";
  });
</script>

<style>
  input {
    background-color: black;
    color: white;
    min-width: 16em;
  }
</style>

<input type="text" bind:this={test} />
