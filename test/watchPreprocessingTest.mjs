import { test } from "uvu";
import * as assert from "uvu/assert";
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { context } from "esbuild";
import { sass } from "svelte-preprocess-sass";
import sveltePlugin from "../dist/index.mjs";
import commonOptions from "./commonOptions.js";

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
    const results = await context({
        ...commonOptions,
        entryPoints: ["./test/fixtures/watch-preprocessing/entry.js"],
        outdir: "../example/dist",
        sourcemap: "inline",
        logLevel: "silent",
        plugins: [
            sveltePlugin({
                preprocess: {
                    style: sass(),
                },
            }),
            {
                // this plugin will pass the result back to the promises
                name: "watch-preprocessing",
                setup(build) {
                    build.onEnd((result) => {
                        count++;
                        if (count === 3) {
                            firstRebuild.forceResolve(result);
                        } else if (count === 4) {
                            secondRebuild.forceResolve(result);
                        }
                    });
                },
            },
        ],
    });

    await results.rebuild(); // have to do an initial build to prime everything
    await results.rebuild(); // do one more good build to start caching

    // start watching
    results.watch().catch((err) => {
        console.error(err);
    });

    try {
        // write external scss with invalid syntax
        writeFileSync(
            `${__dirname}/fixtures/watch-preprocessing/external.scss`,
            "p { color: red; }!$%^&*()@$%^@@",
        );
        const firstRebuildResult = await firstRebuild;
        assert.ok(firstRebuildResult.errors.length !== 0, "First build did not fail");

        // write external scss with valid syntax again
        writeFileSync(
            `${__dirname}/fixtures/watch-preprocessing/external.scss`,
            "p {\n  color: red;\n}\n",
        );
        const secondRebuildResult = await secondRebuild;
        assert.ok(secondRebuildResult.errors.length === 0, "Second build fail");
    } finally {
        // stop watching
        results.dispose();
    }
});

test.run();
