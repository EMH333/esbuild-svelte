import { test } from "uvu";
import * as assert from "uvu/assert";
import { build as _build } from "esbuild";
import { typescript } from "svelte-preprocess-esbuild";
import sveltePlugin from "../dist/index.mjs";

test("Errors (with preprocessors) are in the right spot", async () => {
    try {
        await _build({
            entryPoints: ["./test/fixtures/errors/entry.js"],
            outdir: "../example/dist",
            bundle: true,
            write: false, //Don't write anywhere
            sourcemap: true,
            plugins: [
                sveltePlugin({
                    preprocess: [typescript()],
                    compilerOptions: { dev: true },
                }),
            ],
            logLevel: "silent",
        });
    } catch (e) {
        assert.equal(e.errors.length, 1, "Should have one error");
        assert.equal(e.warnings.length, 0, "Should not have warnings");

        const error = e.errors[0];

        assert.equal(
            error.location.file,
            "test/fixtures/errors/error.svelte",
            "Should have the right file"
        );
        assert.equal(error.location.line, 12, "Should have the right line");
        assert.equal(error.location.column, 31, "Should have the right column");
        assert.equal(
            error.text,
            "Expected value for the attribute",
            "Should have the right error message"
        );
        return;
    }

    assert.unreachable("Should have thrown an error");
});

test.run();
