<script lang="ts">
  interface Test {
    yellThisThing: String;
  }

  // some sort of javascript error
  function event() {
    console.log({ yellThisThing: "something" } as Test);
  }
</script>

<button on:click={event} class=>Yell "something"</button>
