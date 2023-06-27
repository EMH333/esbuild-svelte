import { test } from "uvu";
import * as assert from "uvu/assert";
import { build } from "esbuild";
import { mkdirSync, unlinkSync, writeFileSync } from "fs";
import { sass } from "svelte-preprocess-sass";
import sveltePlugin from "../dist/index.mjs";
import { tmpdir } from "os";
import { join } from "path";
import commonOptions from "./commonOptions.js";

//with cache enabled
test("Basic cache", async () => {
    await build({
        ...commonOptions,
        entryPoints: ["./example-js/entry.js"],
        outdir: "../example-js/dist",
        plugins: [sveltePlugin({ cache: true })],
    });
});

async function incrementalTest() {
    let result = await build({
        ...commonOptions,
        entryPoints: ["./example-js/entry.js"],
        outdir: "../example-js/dist",
        plugins: [sveltePlugin({ cache: true })],
        incremental: true,
    });

    // Call "rebuild" as many times as you want
    for (let i = 0; i < 5; i++) {
        await result.rebuild();
    }

    // Call "dispose" when you're done to free up resources.
    result.rebuild.dispose();
}

test("Cache w/ rebuild", async () => {
    await incrementalTest();
});

//set up a basic incremental build for use in other tests
async function depsSetup(cacheType) {
    if (cacheType == undefined) {
        cacheType = true;
    }

    const dirname = join(tmpdir(), "esbuild-svelte");
    mkdirSync(dirname, { recursive: true });
    writeFileSync(join(dirname, "/app.js"), 'import x from "./foo.svelte"\nconsole.log(x)');
    writeFileSync(
        join(dirname, "/foo.svelte"),
        '<style lang="sass">@import "./xyz.sass"</style><div class="xyz">foo</div>'
    );

    // Set color to red
    writeFileSync(join(dirname, "/xyz.sass"), ".xyz\n  color: red");
    const result = await build({
        ...commonOptions,
        entryPoints: [join(dirname, "/app.js")],
        incremental: true,
        outdir: "./dist",
        external: ["svelte/internal"],
        plugins: [
            sveltePlugin({
                preprocess: {
                    style: sass(),
                },
                cache: cacheType,
            }),
        ],
        logLevel: "silent",
    });
    return { result, dirname };
}

test("Preprocess w/ deps basic", async () => {
    let { result, dirname } = await depsSetup();

    // Set color to green
    writeFileSync(join(dirname, "/xyz.sass"), ".xyz\n  color: green");
    const result2 = await result.rebuild();

    result.rebuild.dispose();

    assert.match(result.outputFiles[1].text, "red");
    assert.match(result2.outputFiles[1].text, "green");
});

test("Preprocess w/ deps delete", async () => {
    let { result, dirname } = await depsSetup();

    // remove file
    unlinkSync(join(dirname, "/xyz.sass"));
    try {
        await result.rebuild();
        assert.not.ok(true);
    } catch (err) {
        assert.ok(err.errors, "Rebuild should generate an exception when file deleted");
        assert.not.match(
            err.errors[0].text,
            "stat",
            "`stat` shouldn't be generating the error message"
        );
        assert.ok(err.errors.length == 1, "There should be one error");
    } finally {
        result.rebuild.dispose();
    }
});

test("Don't cache errors", async () => {
    let { result, dirname } = await depsSetup();

    // remove file
    unlinkSync(join(dirname, "/xyz.sass"));
    try {
        await result.rebuild();
        assert.not.ok(true);
    } catch (err) {
        assert.ok(err.errors); //expect to throw from rebuild
    }

    // bring it back
    // the previous error should go away
    writeFileSync(join(dirname, "/xyz.sass"), ".xyz\n  color: green");
    try {
        await result.rebuild();
        assert.ok(true);
    } catch (err) {
        assert.not.ok(true); //expect to not to
    } finally {
        result.rebuild.dispose();
    }
});

test("Overzealous cache with preprocessor", async () => {
    let { result, dirname } = await depsSetup("overzealous");

    // Set color to green
    writeFileSync(join(dirname, "/xyz.sass"), ".xyz\n  color: green");
    const result2 = await result.rebuild();

    result.rebuild.dispose();

    assert.match(result.outputFiles[1].text, "red");
    assert.match(result2.outputFiles[1].text, "green");
});

test("Overzealous cache should still build", async () => {
    let result = await build({
        ...commonOptions,
        entryPoints: ["./example-js/entry.js"],
        outdir: "../example-js/dist",
        plugins: [sveltePlugin({ cache: "overzealous" })],
        incremental: true,
    });

    // Call "rebuild" as many times as you want
    for (let i = 0; i < 5; i++) {
        await result.rebuild();
    }

    // Call "dispose" when you're done to free up resources.
    result.rebuild.dispose();
});

test.run();
