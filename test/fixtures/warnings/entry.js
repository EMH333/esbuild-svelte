import { mount } from "svelte";
import Test from "./missing-declaration.svelte";

mount(Test, {
    target: document.body,
});
