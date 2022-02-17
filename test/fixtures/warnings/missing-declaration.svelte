<div>
  <!-- This will generate a warning about unknown MY_GLOBAL -->
  {#if MY_GLOBAL}
  <p>MY_GLOBAL is truthy</p>
  {:else}
  <p>MY_GLOBAL is falsy</p>
  {/if}

  <!-- This will generate a warning about missing alt -->
  <img src="foo.jpg" />
</div>
