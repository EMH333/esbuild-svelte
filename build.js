#!/usr/bin/env node
const { readFile, writeFile } = require("fs");
const { promisify } = require("util");
const esbuild = require("esbuild");
const ts = require("typescript");
const { rewrite } = require("rewrite-imports");

const read = promisify(readFile);
const write = promisify(writeFile);

const esbuildCommon = {
    entryPoints: ["./index.ts"],
    platform: "node",
    target: ["node14.19.3"],
};

(async function () {
    //start esbuild process
    let result = esbuild.build({
        format: "esm",
        outfile: "./dist/index.mjs",
        ...esbuildCommon,
    });

    // run .d.ts generation now since it takes a while
    const program = ts.createProgram(["index.ts"], {
        declaration: true,
        emitDeclarationOnly: true,
        outDir: "./dist",
    });
    program.emit();

    //wait for esbuild to finish then rewrite imports for cjs version
    await result;
    let output = await read("./dist/index.mjs", "utf8");
    await write(
        "./dist/index.js",
        rewrite(output).replace(
            /export {.*sveltePlugin as default.*};/s,
            "module.exports = sveltePlugin;",
        ),
    );
})().catch((err) => {
    console.error("ERROR", err.stack || err);
    process.exit(1);
});
