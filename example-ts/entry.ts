import Test from "./index.svelte";
import { haha } from "./fun";
import { mount } from "svelte";

mount(Test, { target: document.body });
console.log(haha());
