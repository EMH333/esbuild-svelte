<script>
  import Second from "./second.svelte";
  let lol;

  function change() {
    lol.value = "testing" + Math.random();
  }
</script>

<style>
  .test {
    background-color: black;
  }
</style>

<div class="test"><input type="text" this:bind={lol} /></div>

<Second />

<button on:click={change} />
