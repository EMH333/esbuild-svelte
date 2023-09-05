<script lang="typescript">
  interface Test {
    yellThisThing: String;
  }

  function event() {
    tryThisThing({ yellThisThing: "something!" });
    change();
  }

  function tryThisThing(input: Test) {
    console.log(input.yellThisThing.toUpperCase());
  }

  let inputBinding: HTMLInputElement;

  function change() {
    inputBinding.value = "testing" + Math.round(Math.random() * 100);
  }
</script>

<button on:click={event} class="sourcemap">Yell "something"</button>
<input type="text" name="testingInput" bind:this={inputBinding} />

<img src="foo.jpg" />

<style lang="scss">
  @use "sourcemapImport.scss";
  @use "sass:color";
  .sourcemap {
    $primary-color: #6b717f;
    color: $primary-color;
    border: 1px solid color.scale($primary-color, $lightness: 20%);
  }
</style>
