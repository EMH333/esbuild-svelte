import { existsSync, mkdirSync } from "fs";
import { build } from "esbuild";
import sveltePlugin from "./index.mjs";

const esbuildVersion = process.argv[2];
const svelteVersion = process.argv[3];

//make sure the directoy exists before stuff gets put into it
if (!existsSync("./dist/")) {
    mkdirSync("./dist/");
}

//build the application
build({
    entryPoints: [Number(svelteVersion.at(0)) >= 5 ? "./entry5.js" : "./entry.js"],
    mainFields: ["svelte", "browser", "module", "main"],
    conditions: ["svelte", "browser"],
    target: "es2016",
    outdir: "./dist",
    format: "esm",
    logLevel: "info",
    minify: false, //so the resulting code is easier to understand
    bundle: true,
    splitting: true,
    sourcemap: "external",
    plugins: [sveltePlugin()],
})
    .then((results) => {
        if (results.warnings.length > 0) {
            console.error(
                "Build had warnings with esbuild version " +
                    esbuildVersion +
                    " and svelte version " +
                    svelteVersion,
            );
            process.exit(1);
        }
    })
    .catch((err) => {
        console.error(err);
        console.error(
            "Build failed with esbuild version " +
                esbuildVersion +
                " and svelte version " +
                svelteVersion,
        );
        process.exit(1);
    });
