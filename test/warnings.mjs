import { test } from "uvu";
import * as assert from "uvu/assert";
import { build as _build } from "esbuild";
import { typescript } from "svelte-preprocess-esbuild";
import sveltePlugin from "../dist/index.mjs";
import commonOptions from "./commonOptions.js";

test("Can filter out warnings", async () => {
    const resultsWithoutFilter = await _build({
        ...commonOptions,
        entryPoints: ["./test/fixtures/warnings/entry.js"],
        outdir: "../example/dist",
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
        ...commonOptions,
        entryPoints: ["./test/fixtures/warnings/entry.js"],
        outdir: "../example/dist",
        sourcemap: true,
        plugins: [
            sveltePlugin({
                preprocess: typescript(),
                compilerOptions: { dev: true },
                filterWarnings: (warning) => {
                    // Ignore warning about the missing MY_GLOBAL.
                    if (
                        warning.code === "missing-declaration" &&
                        warning.message.startsWith("'MY_GLOBAL' is not defined")
                    ) {
                        return false;
                    }

                    return true;
                },
            }),
        ],
        logLevel: "silent",
    });

    assert.equal(resultsWithoutFilter.warnings.length, 2, "Should have two warnings");
    assert.equal(resultsWithoutFilter.errors.length, 0, "Should not have errors");
    assert.equal(resultsWithFilter.warnings.length, 1, "Should have one warning");
    assert.equal(
        resultsWithFilter.warnings[0].text,
        "A11y: <img> element should have an alt attribute",
        "The not filtered warning is still there",
    );
    assert.equal(resultsWithFilter.errors.length, 0, "Should not have errors");
});

test.run();
