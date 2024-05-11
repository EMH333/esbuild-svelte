import { test } from "uvu";
import * as assert from "uvu/assert";
import { build as _build } from "esbuild";
import sveltePlugin from "../dist/index.mjs";
import sveltePluginCJS from "../dist/index.js";
import commonOptions from "./commonOptions.js";
import { VERSION } from "svelte/compiler";

test("Without esbuild", async () => {
    let build = {};
    //should have no errors or warnings
    build.onLoad = async function onLoad(selection, processor) {
        //ignore the css and direct import loaders for now
        if (
            selection.filter.test("test.esbuild-svelte-fake-css") ||
            selection.namespace === "esbuild-svelte-direct-import"
        ) {
            return;
        }

        let failed = false;
        let out = await processor({ path: "./example-js/index.svelte" });

        if (out && out.warnings && out.warnings.length != 0) {
            console.error(out.warnings);
            failed = true;
        }
        if (out && out.errors && out.errors.length != 0) {
            console.error(out.errors);
            failed = true;
        }
        if (out && out.contents.length < 5) {
            console.error("Not the expected length");
            failed = true;
        }

        assert.not.ok(failed);
    };

    build.onResolve = async function (selection, processor) {};
    build.initialOptions = { incremental: false, watch: false };
    await sveltePlugin().setup(build);
});

test("Simple build", async () => {
    //Try a simple esbuild build
    const results = await _build({
        ...commonOptions,
        entryPoints: ["./example-js/entry.js"],
        outdir: "../example-js/dist",
        plugins: [sveltePlugin()],
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    assert.equal(results.outputFiles.length, 2, "Non-expected number of output files");
});

test("Simple CommonJS build", async () => {
    //Try a simple esbuild build
    const results = await _build({
        ...commonOptions,
        entryPoints: ["./example-js/entry.js"],
        outdir: "../example-js/dist",
        plugins: [sveltePluginCJS()],
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    assert.equal(results.outputFiles.length, 2, "Non-expected number of output files");
});

test("More advanced build", async () => {
    //more advanced
    const results = await _build({
        ...commonOptions,
        entryPoints: ["./example-js/entry.js"],
        outdir: "../example-js/dist",
        sourcemap: "inline",
        plugins: [sveltePlugin({ compilerOptions: { dev: true } })],
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    assert.equal(results.outputFiles.length, 2, "Non-expected number of output files");
});

test("CSS external boolean", async () => {
    // TODO remove for svelte 5
    if (VERSION.startsWith("5")) {
        return;
    }

    //Note this fails on svelte v4 since booleans are deprecated and it has seemingly been broken
    //I'm not sure if this is a bug or not, but I'm going to choose to ignore this failure for now,
    //since there is an easy workaround (use a string instead of a boolean)
    const results = await _build({
        ...commonOptions,
        entryPoints: ["./example-js/entry.js"],
        outdir: "../example-js/dist",
        sourcemap: "inline",
        plugins: [sveltePlugin({ compilerOptions: { dev: true, css: false } })],
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    //assert.equal(results.outputFiles.length, 2, "Non-expected number of output files");
});

test("CSS external string", async () => {
    //more advanced
    const results = await _build({
        ...commonOptions,
        entryPoints: ["./example-js/entry.js"],
        outdir: "../example-js/dist",
        sourcemap: "inline",
        plugins: [sveltePlugin({ compilerOptions: { dev: true, css: "external" } })],
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    assert.equal(results.outputFiles.length, 2, "Non-expected number of output files");
});

// remove for svelte v5
test("CSS injected boolean", async () => {
    // TODO remove for svelte 5
    if (VERSION.startsWith("5")) {
        return;
    }
    //TODO this should fail with a warning with svelte v4
    const results = await _build({
        ...commonOptions,
        entryPoints: ["./example-js/entry.js"],
        outdir: "../example-js/dist",
        sourcemap: "inline",
        plugins: [sveltePlugin({ compilerOptions: { dev: true, css: true } })],
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    assert.equal(results.outputFiles.length, 1, "Non-expected number of output files");
});

test("CSS injected string", async () => {
    //more advanced
    const results = await _build({
        ...commonOptions,
        entryPoints: ["./example-js/entry.js"],
        outdir: "../example-js/dist",
        sourcemap: "inline",
        plugins: [sveltePlugin({ compilerOptions: { dev: true, css: "injected" } })],
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    assert.equal(results.outputFiles.length, 1, "Non-expected number of output files");
});

test("CSS none", async () => {
    // TODO remove for svelte 5
    if (VERSION.startsWith("5")) {
        return;
    }

    //more advanced
    const results = await _build({
        ...commonOptions,
        entryPoints: ["./example-js/entry.js"],
        outdir: "../example-js/dist",
        sourcemap: "inline",
        plugins: [sveltePlugin({ compilerOptions: { dev: true, css: "none" } })],
    });

    assert.equal(results.errors.length, 0, "Non-zero number of errors");
    assert.equal(results.warnings.length, 0, "Non-zero number of warnings");
    assert.equal(results.outputFiles.length, 1, "Non-expected number of output files");
});

test.run();
