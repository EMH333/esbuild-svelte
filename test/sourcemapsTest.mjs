import { test } from "uvu";
import * as assert from "uvu/assert";
import { relative } from "path";
import { build } from "esbuild";
import { typescript } from "svelte-preprocess-esbuild";
import { sass } from "./utils/scss-preprocess.mjs";
import sveltePlugin from "../dist/index.mjs";
import commonOptions from "./utils/commonOptions.js";

test("Preprocessor Sourcemap test", async () => {
    const result = await build({
        ...commonOptions,
        entryPoints: ["./test/fixtures/preprocessing-sourcemaps/pp-sourcemaps.js"],
        outdir: "../example/dist",
        sourcemap: "external",
        outdir: "out",
        plugins: [sveltePlugin({ preprocess: [{ style: sass() }, typescript()] })],
        logLevel: "silent",
    });

    assert.equal(result.warnings.length, 1, "Should one warning"); // because of warnings tests
    assert.equal(result.errors.length, 0, "Should not have errors");

    assert.equal(result.outputFiles.length, 4);

    for (let out of result.outputFiles) {
        if (relative(process.cwd(), out.path) === "out/pp-sourcemaps.js.map") {
            const json = JSON.parse(out.text);

            //console.log(out.text);
            assert.match(out.text, /<script lang=\\"typescript\\">/);
            assert.match(out.text, /interface Test/);
            assert.ok(
                json.sources.includes("../test/fixtures/preprocessing-sourcemaps/pp-sourcemaps.js"),
            );
            assert.ok(
                json.sources.includes(
                    "../test/fixtures/preprocessing-sourcemaps/pp-sourcemaps.svelte",
                ),
            );
            assert.not.ok(json.sourcesContent.includes(null), "Sourcemap includes null");
            assert.ok(json.mappings.length > 3900); //note this is kind of an random number, but failing this should prompt
            //more investigation into why it suddenly got shorter
        }
    }
});

test.run();
