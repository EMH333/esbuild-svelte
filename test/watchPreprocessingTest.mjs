import { test } from "uvu";
import * as assert from "uvu/assert";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { build as _build } from "esbuild";
import { sass } from "svelte-preprocess-sass";
import sveltePlugin from "../dist/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

test("Watch and build while preprocess of external dependency succeed and fails", async () => {
    function _createDeferred() {
        let resolve = null;
        let reject = null;
        const promise = new Promise((_resolve, _reject) => {
            resolve = _resolve;
            reject = _reject;
        });
        promise.forceResolve = resolve;
        promise.forceReject = reject;
        return promise;
    }

    let count = 0;
    const firstRebuild = _createDeferred();
    const secondRebuild = _createDeferred();

    //more advanced
    const results = await _build({
        entryPoints: ["./test/fixtures/watch-preprocessing/entry.js"],
        outdir: "../example/dist",
        format: "esm",
        minify: true,
        bundle: true,
        splitting: true,
        write: false, //Don't write anywhere
        sourcemap: "inline",
        logLevel: "silent",
        plugins: [
            sveltePlugin({
                preprocess: {
                    style: sass(),
                },
            }),
        ],
        watch: {
            onRebuild(err, result) {
                count++;
                if (count === 1) {
                    firstRebuild.forceResolve(err);
                } else if (count === 2) {
                    secondRebuild.forceResolve(result);
                }
            },
        },
    });

    // write external scss with invalid syntax
    writeFileSync(
        `${__dirname}/fixtures/watch-preprocessing/external.scss`,
        "p { color: red; }!$%^&*()@$%^@@"
    );
    const firstRebuildResult = await firstRebuild;
    assert.ok(firstRebuildResult instanceof Error, "First build did not fail");

    // write external scss with valid syntax again
    writeFileSync(
        `${__dirname}/fixtures/watch-preprocessing/external.scss`,
        "p {\n  color: red;\n}\n"
    );
    const secondRebuildResult = await secondRebuild;
    assert.ok(secondRebuildResult.errors.length === 0, "Second build fail");

    // stop watching
    results.stop();
});

test.run();
