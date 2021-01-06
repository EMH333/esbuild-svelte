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
    plugins: [sveltePlugin({preprocessor: preprocess({
        typescript: { compilerOptions: { sourceMap: true, inlineSources: true } }, sourceMap: true
    })}),]
}).catch((err) => {
    console.error("Preprocessor Sourcemap Test Failed")
    console.error(err)
    process.exit(1)
}).then((result) => {
    for (let out of result.outputFiles) {
        if(path.relative(process.cwd(), out.path) === "out/pp-sourcemaps.js.map") {
            if(out.text.includes("<script lang=\\\"ts\\\">") && out.text.includes("interface Test")){
                console.log("Preprocessor Sourcemap Test Passed");
                return; //test passed
            }
        }
    }
    console.error("Preprocessor Sourcemap Test Failed")
    process.exit(1)
})


