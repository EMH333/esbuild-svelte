import { mount } from "svelte";
import Test from "./non-ascii.svelte";

mount(Test, {
    target: document.body,
});
