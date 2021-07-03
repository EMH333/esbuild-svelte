import { test } from "uvu";
import { build as _build } from "esbuild";
import sveltePlugin from "../dist/index.mjs";
import { assert } from "console";

test("Without esbuild", async () => {
    let build = {};
    //should have no errors or warnings
    build.onLoad = async function onLoad(selection, processor) {
        //ignore the css loader for now
        if (selection.filter.test("test.esbuild-svelte-fake-css")) {
            return;
        }

        let failed = false;
        let out = await processor({ path: "./example/index.svelte" });

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

        assert(!failed);
    };

    build.onResolve = async function (selection, processor) {};
    build.initialOptions = { incremental: false, watch: false };
    await sveltePlugin().setup(build);
});

test("Simple build", async () => {
    //Try a simple esbuild build
    await _build({
        entryPoints: ["./example/entry.js"],
        outdir: "../example/dist",
        format: "esm",
        minify: true,
        bundle: true,
        splitting: true,
        write: false, //Don't write anywhere
        plugins: [sveltePlugin()],
    });
});

test("More advanced build", async () => {
    //more advanced
    await _build({
        entryPoints: ["./example/entry.js"],
        outdir: "../example/dist",
        format: "esm",
        minify: true,
        bundle: true,
        splitting: true,
        write: false, //Don't write anywhere
        plugins: [sveltePlugin({ compileOptions: { dev: true } })],
    });
});

test.run();
