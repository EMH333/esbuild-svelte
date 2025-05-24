import { test } from "uvu";
import * as assert from "uvu/assert";
import { build } from "esbuild";
import sveltePlugin from "../dist/index.mjs";
import commonOptions from "./commonOptions.js";

test("Include option works correctly", async () => {
    const results = await build({
        ...commonOptions,
        entryPoints: ["./test/fixtures/include/entry.js"],
        outdir: "../example/dist",
        sourcemap: "inline",
        plugins: [
            sveltePlugin({
                include: /\.notSvelte$/,
            }),
        ],
    });

    assert.equal(results.errors.length, 0, "Expected zero errors");
    assert.equal(results.warnings.length, 0, "Expected zero warnings");
    assert.equal(results.outputFiles.length, 1, "Expected a single output file");
});

test.run();
