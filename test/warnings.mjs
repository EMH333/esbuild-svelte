import { test } from "uvu";
import * as assert from "uvu/assert";
import { build as _build } from "esbuild";
import { typescript } from "svelte-preprocess-esbuild";
import { sass } from "svelte-preprocess-sass";
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

test("Warnings are in the right spot", async () => {
    const results = await _build({
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

    assert.equal(results.warnings.length, 2, "Should have two warnings");
    assert.equal(results.errors.length, 0, "Should not have errors");
    assert.equal(results.warnings[0].location.column, 7, "Column is correct");
    assert.equal(results.warnings[0].location.line, 3, "Line is correct");
    assert.equal(results.warnings[0].location.length, 9, "Length is correct");
    assert.equal(
        results.warnings[0].location.lineText,
        "  {#if MY_GLOBAL}",
        "Line text is correct"
    );
    assert.match(results.warnings[0].text, /'MY_GLOBAL' is not defined/);
});

test("Preprocessor warnings are as expected", async () => {
    const results = await _build({
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
        logLevel: "silent",
    });

    assert.equal(results.outputFiles.length, 4);
    assert.equal(results.warnings.length, 1, "Should have one warnings");
    assert.equal(results.errors.length, 0, "Should not have errors");

    assert.equal(results.warnings[0].location.column, 0, "Column is correct");
    assert.equal(results.warnings[0].location.line, 25, "Line is correct");
    assert.equal(results.warnings[0].location.length, 21, "Length is correct");
});

test.run();
