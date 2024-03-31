import { test } from "uvu";
import * as assert from "uvu/assert";
import { build } from "esbuild";
import sveltePlugin from "../dist/index.mjs";
import commonOptions from "./commonOptions.js";

test("Simple Svelte v5 build", async () => {
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

test.run();
