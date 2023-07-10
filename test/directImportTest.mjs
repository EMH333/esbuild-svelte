import { test } from "uvu";
import * as assert from "uvu/assert";
import { build as _build } from "esbuild";
import sveltePlugin from "../dist/index.mjs";
import commonOptions from "./commonOptions.js";

test("Can handle direct svelte files", async () => {
    try {
        const results = await _build({
            ...commonOptions,
            entryPoints: ["./example-js/index.svelte"],
            outdir: "../example-js/dist",
            sourcemap: "inline",
            plugins: [sveltePlugin({ compilerOptions: { dev: true }, fromEntryFile: true })],
            logLevel: "silent",
        });
        assert.not.ok(true, "Should have errored");
    } catch (err) {
        assert.ok(err.errors, "Should error as direct imports aren't supported yet");
        assert.match(
            err.errors[0].text,
            "does not support creating entry files yet",
            "Should be my error message",
        );
        assert.ok(err.errors.length == 1, "There should be one error");
    }
});

test.run();
