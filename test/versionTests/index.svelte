<script>
  let inputBinding;

  function change() {
    inputBinding.value = "testing" + Math.round(Math.random() * 100);
  }
</script>

<style>
  .test {
    display: inline-block;
    background-color: #ff3e00;
    color: white;
  }

  .secondStyle {
    display: block;
  }
</style>

<div class="test">
  <label for="testingInput">This gets changed when you press the button:
  </label>
  <input type="text" name="testingInput" bind:this={inputBinding} />
</div>

<div class="secondStyle">
  <button on:click={change}>Click this button!</button>
</div>
