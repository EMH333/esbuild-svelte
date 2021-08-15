import { test } from "uvu";
import * as assert from "uvu/assert";
import { relative } from "path";
import { build } from "esbuild";
import { typescript } from "svelte-preprocess-esbuild";
import { sass } from "svelte-preprocess-sass";
import sveltePlugin from "../dist/index.mjs";

test("Preprocessor Sourcemap test", async () => {
    const result = await build({
        entryPoints: ["./test/fixtures/preprocessing-sourcemaps/pp-sourcemaps.js"],
        outdir: "../example/dist",
        format: "esm",
        minify: true,
        bundle: true,
        splitting: true,
        write: false, //Don't write anywhere
        sourcemap: "external",
        outdir: "out",
        plugins: [sveltePlugin({ preprocess: [{ style: sass() }, typescript()] })],
    });

    assert.equal(result.outputFiles.length, 4);

    for (let out of result.outputFiles) {
        if (relative(process.cwd(), out.path) === "out/pp-sourcemaps.js.map") {
            const json = JSON.parse(out.text);

            //console.log(out.text);
            assert.match(out.text, /<script lang=\\"ts\\">/);
            assert.match(out.text, /interface Test/);
            assert.equal(json.sources.length, 3);
            assert.not.ok(json.sourcesContent.includes(null), "Sourcemap includes null");
            assert.ok(json.mappings.length > 3900); //note this is kind of an random number, but failing this should prompt
            //more investigation into why it suddenly got shorter
        }
    }
});

test.run();
