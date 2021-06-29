import { test } from 'uvu';
import { build } from "esbuild";
import sveltePlugin from "../dist/index.mjs";

//with cache enabled
test("Basic cache", () => {
    build({
        entryPoints: ['./example/entry.js'],
        outdir: '../example/dist',
        format: "esm",
        minify: true,
        bundle: true,
        splitting: true,
        write: false, //Don't write anywhere
        plugins: [sveltePlugin({ cache: true }),]
    })
})


async function incrementalTest() {
    let result = await build({
        entryPoints: ['./example/entry.js'],
        outdir: '../example/dist',
        format: "esm",
        minify: true,
        bundle: true,
        splitting: true,
        write: false, //Don't write anywhere
        plugins: [sveltePlugin({ cache: true }),],
        incremental: true
    })

    // Call "rebuild" as many times as you want
    for (let i = 0; i < 5; i++) {
        await result.rebuild();
    }

    // Call "dispose" when you're done to free up resources.
    result.rebuild.dispose()
}

test("Cache w/ rebuild", () => {
    incrementalTest();
})

test.run();
