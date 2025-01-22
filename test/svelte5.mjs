import { test } from "uvu";
import * as assert from "uvu/assert";
import { build } from "esbuild";
import sveltePlugin from "../dist/index.mjs";
import commonOptions from "./commonOptions.js";
import { VERSION } from "svelte/compiler";

test("Simple Svelte v5 build", async () => {
    // only run for svelte 5
    if (!VERSION.startsWith("5")) {
        return;
    }

    //Try a simple build with v5 features
    const results = await build({
        ...commonOptions,
        entryPoints: ["./test/fixtures/svelte5/entry.js"],
        outdir: "./example-js/dist",
        sourcemap: true,
        plugins: [
            sveltePlugin({
                compilerOptions: { dev: true },
            }),
        ],
        logLevel: "silent",
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    assert.equal(results.outputFiles.length, 2, "Non-expected number of output files");
});

test("Svelte module javascript files", async () => {
    // only run for svelte 5
    if (!VERSION.startsWith("5")) {
        return;
    }

    //Try a simple build with v5 features
    const results = await build({
        ...commonOptions,
        entryPoints: ["./test/fixtures/svelte5/javascript-modules/entry.js"],
        outdir: "./example-js/dist",
        sourcemap: true,
        plugins: [
            sveltePlugin({
                compilerOptions: { dev: true },
            }),
        ],
        logLevel: "silent",
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    assert.equal(results.outputFiles.length, 2, "Non-expected number of output files");
});

test("Svelte module typescript files", async () => {
    // only run for svelte 5
    if (!VERSION.startsWith("5")) {
        return;
    }

    //Try a simple build with v5 features
    const results = await build({
        ...commonOptions,
        entryPoints: ["./test/fixtures/svelte5/typescript-modules/entry.ts"],
        outdir: "./example-js/dist",
        sourcemap: true,
        plugins: [
            sveltePlugin({
                compilerOptions: { dev: true },
            }),
        ],
        logLevel: "silent",
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    assert.equal(results.outputFiles.length, 2, "Non-expected number of output files");
});

test("Svelte module typescript files minification", async () => {
    // only run for svelte 5
    if (!VERSION.startsWith("5")) {
        return;
    }

    const results = await build({
        ...commonOptions,
        entryPoints: ["./test/fixtures/ts-module-minification/entry.ts"],
        outdir: "./example-js/dist",
        sourcemap: true,
        minify: true,
        plugins: [
            sveltePlugin({
                compilerOptions: { dev: true },
            }),
        ],
        logLevel: "silent",
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    assert.equal(results.outputFiles.length, 2, "Non-expected number of output files");
});

test.run();
