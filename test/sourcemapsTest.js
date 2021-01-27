const path = require("path");

const esbuild = require("esbuild");
const preprocess = require("svelte-preprocess");
const sveltePlugin = require("../dist/index");

esbuild.build({
    entryPoints: ['./test/fixtures/preprocessing-sourcemaps/pp-sourcemaps.js'],
    outdir: '../example/dist',
    format: "esm",
    minify: true,
    bundle: true,
    splitting: true,
    write: false, //Don't write anywhere
    sourcemap: 'external',
    outdir: 'out',
    plugins: [sveltePlugin({ preprocessor: preprocess() }),]
}).catch((err) => {
    console.error("Preprocessor Sourcemap Test Failed")
    console.error(err)
    process.exit(1)
}).then((result) => {
    for (let out of result.outputFiles) {
        if (path.relative(process.cwd(), out.path) === "out/pp-sourcemaps.js.map") {
            const json = JSON.parse(out.text);
            if (out.text.includes("<script lang=\\\"ts\\\">")
                && out.text.includes("interface Test")
                && json.sources.length == 3
                && !json.sourcesContent.includes(null)
                //note this is kind of an random number, but failing this should prompt
                //more investigation into why it suddenly got shorter
                && json.mappings.length > 3900) {
                console.log("Preprocessor Sourcemap Test Passed");
                return; //test passed
            } else {
                console.error(out.text); //test didn't pass so print why
            }
        }
    }
    console.error("Preprocessor Sourcemap Test Failed")
    process.exit(1)
})


