import { test } from "uvu";
import * as assert from "uvu/assert";
import { build as _build } from "esbuild";
import { sass } from "svelte-preprocess-sass";
import sveltePlugin from "../dist/index.mjs";

test("Fake CSS returns correct resolve directory", async () => {
    //more advanced
    const results = await _build({
        entryPoints: ["./test/fixtures/resolveDirectory/entry.js"],
        outdir: "../example/dist",
        format: "esm",
        minify: true,
        bundle: true,
        splitting: true,
        write: false, //Don't write anywhere
        sourcemap: "inline",
        loader: {
            ".png": "file",
        },
        plugins: [
            sveltePlugin({
                preprocess: {
                    style: sass(),
                },
            }),
        ],
    });

    assert.ok(results.errors.length === 0, "Non-zero number of errors");
    assert.ok(results.warnings.length === 0, "Non-zero number of warnings");
    assert.ok(results.outputFiles.length === 3, "Non-expected number of output files");
});

test.run();
