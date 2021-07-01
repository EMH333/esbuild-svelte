import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "fs";
import { sass } from "svelte-preprocess-sass";
import sveltePlugin from "../dist/index.mjs";
import { tmpdir } from 'os';
import { join } from 'path';

//with cache enabled
test("Basic cache", async () => {
    await build({
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

test("Cache w/ rebuild", async () => {
    await incrementalTest();
});

test("Preprocess w/ deps", (async () => {
    const dirname = join(tmpdir(), "esbuild-svelte");
    mkdirSync(dirname, {recursive: true});
    writeFileSync(join(dirname, '/app.js'), 'import x from "./foo.svelte"\nconsole.log(x)');
    writeFileSync(join(dirname, '/foo.svelte'), '<style lang="sass">@import "./xyz.sass"</style><div class="xyz">foo</div>');

    // Set color to red
    writeFileSync(join(dirname, '/xyz.sass'), '.xyz\n  color: red');
    const result = await build({
        entryPoints: [join(dirname, '/app.js')],
        bundle: true,
        incremental: true,
        write: false,
        outfile: 'out.js',
        external: ["svelte/internal"],
        plugins: [sveltePlugin({
            preprocess: {
                style: sass(),
            },
        })],
        logLevel: 'info',
    });
    assert.match(result.outputFiles[1].text, "red");

    // Set color to green
    writeFileSync(join(dirname, '/xyz.sass'), '.xyz\n  color: green');
    const result2 = await result.rebuild();
    assert.match(result2.outputFiles[1].text, "green");

    result.rebuild.dispose();
}));


test.run();
