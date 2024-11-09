<script lang="ts">
  import {haha} from "./fun";
  import type {Joke} from "./fun";
  import Second from "./second.svelte";
  import Counter from "./test.svelte";
  let inputBinding : HTMLInputElement;

  const counter: Counter = new Counter();

  const jo : Joke = {
    rating: 2, joke: "123",
  }

  function add(a: number, b: number) : number {
    return a + b;
  }

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
  <button onclick={change}>Click this button!</button>
  <button onclick={() => counter.value++}>Increment rune counter</button>

  {counter.value}
  <p>{haha()}</p>
  <p>{add(1,4)}</p>
  <p>{JSON.stringify(jo)}</p>
  <Second />
</div>
