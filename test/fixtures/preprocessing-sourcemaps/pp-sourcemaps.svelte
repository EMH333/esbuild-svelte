<script lang="ts">
    interface Test {
        yellThisThing: String;
    }

    function event(){
        tryThisThing({yellThisThing: "something!"});
    }

    function tryThisThing(input: Test) {
        console.log(input.yellThisThing.toUpperCase());
    }  
</script>

<button on:click={event}>Yell "something"</button>
