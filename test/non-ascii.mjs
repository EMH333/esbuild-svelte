import { test } from "uvu";
import * as assert from "uvu/assert";
import { build as _build } from "esbuild";
import { typescript } from "svelte-preprocess-esbuild";
import sveltePlugin from "../dist/index.mjs";

test("Can handle special characters in files", async () => {
    try {
        const results = await _build({
            entryPoints: ["./test/fixtures/non-ascii/entry.js"],
            outdir: "../example/dist",
            bundle: true,
            write: false, //Don't write anywhere
            sourcemap: true,
            plugins: [sveltePlugin({ 
                preprocess: typescript(),
                compileOptions: { dev: true } 
            })],
            logLevel: "silent",
        });
        assert.ok(true, "Should not have triggered exception");
        assert.equal(results.warnings.length, 0, "Should not have warnings");
        assert.equal(results.errors.length, 0, "Should not have errors");
    } catch (err) {
        console.error(err.errors);
        assert.not.ok(err.errors, "Should not error because of invalid characters");
    }
});

test.run();
