import { test } from "uvu";
import * as assert from "uvu/assert";
import { build as _build } from "esbuild";
import sveltePlugin from "../dist/index.mjs";

test("Can handle special characters in files", async () => {
    try {
        const results = await _build({
            entryPoints: ["./test/fixtures/non-ascii/entry.js"],
            outdir: "../example/dist",
            write: false, //Don't write anywhere
            sourcemap: true,
            plugins: [sveltePlugin({ compileOptions: { dev: true } })],
            logLevel: "silent",
        });
        assert.ok(true, "Should not have errored");
    } catch (err) {
        console.error(err);
        assert.not.ok(err.errors, "Should not error because of invalid characters");
    }
});

test.run();
