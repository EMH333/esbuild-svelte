<script lang="ts">
    interface Test {
        yellThisThing: String;
    }

    function event() {
        tryThisThing({ yellThisThing: "something!" });
    }

    function tryThisThing(input: Test) {
        console.log(input.yellThisThing.toUpperCase());
    }
</script>

<style lang="scss">
    @use "sourcemapImport.scss";
    @use "sass:color";
    .sourcemap {
        $primary-color: #6b717f;
        color: $primary-color;
        border: 1px solid color.scale($primary-color, $lightness: 20%);
    }
</style>

<button on:click={event} class="sourcemap">Yell "something"</button>
