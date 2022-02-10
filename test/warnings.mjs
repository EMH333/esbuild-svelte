import { test } from "uvu";
import * as assert from "uvu/assert";
import { build as _build } from "esbuild";
import { typescript } from "svelte-preprocess-esbuild";
import sveltePlugin from "../dist/index.mjs";

test("Can filter out warnings", async () => {
    const resultsWithoutFilter = await _build({
        entryPoints: ["./test/fixtures/warnings/entry.js"],
        outdir: "../example/dist",
        bundle: true,
        write: false, //Don't write anywhere
        sourcemap: true,
        plugins: [
            sveltePlugin({
                preprocess: typescript(),
                compilerOptions: { dev: true },
            }),
        ],
        logLevel: "silent",
    });

    const resultsWithFilter = await _build({
        entryPoints: ["./test/fixtures/warnings/entry.js"],
        outdir: "../example/dist",
        bundle: true,
        write: false, //Don't write anywhere
        sourcemap: true,
        plugins: [
            sveltePlugin({
                preprocess: typescript(),
                compilerOptions: { dev: true },
                filterWarnings: (warning) => {
                    if (warning.code !== "missing-declaration") {
                        return true;
                    }

                    return !warning.message.startsWith("'MY_GLOBAL' is not defined");
                },
            }),
        ],
        logLevel: "silent",
    });

    assert.equal(resultsWithoutFilter.warnings.length, 1, "Should have one warning");
    assert.equal(resultsWithoutFilter.errors.length, 0, "Should not have errors");
    assert.equal(resultsWithFilter.warnings.length, 0, "Should not have a warning");
    assert.equal(resultsWithFilter.errors.length, 0, "Should not have errors");
});

test.run();
