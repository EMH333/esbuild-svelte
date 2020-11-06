/*
THIS IS A TERRIBLE WAY OF TESTING THINGS, I'M SORRY!
It doesn't even test that much :(
Perhaps at some point I will come back and fix this but for now it serves as a simple smoke test

If you really care, you are welcome to create a PR to actually test it!
*/
const esbuild = require("esbuild");



let build = {};
//should have no errors or warnings
build.onLoad = async function onLoad(filter, processor) {
    let failed = false;
    let out = await processor({ path: require.resolve("../example/index.svelte") });

    if (out && out.warnings && out.warnings.length != 0) {
        console.error(out.warnings);
        failed = true;
    }
    if (out && out.errors && out.errors.length != 0) {
        console.error(out.errors)
        failed = true;
    }
    if(out.contents.length < 5){
        console.error("Not the expected length")
        failed = true;
    }

    if (failed) {
        console.error("Test 1 failed");
        process.exit(1);
    } else {
        console.log("Test 1 passed");
    }
};
require("../index").setup(build);



//Try a simple esbuild build
const esbuild_svelte = require("../index");

esbuild.build({
    entryPoints: ['./example/entry.js'],
    outdir: '../example/dist',
    format: "esm",
    minify: true,
    bundle: true,
    splitting: true,
    write: false, //Don't write anywhere
    plugins: [esbuild_svelte,]
}).catch((err) => {
    console.error("Test 2 Failed")
    console.error(err)
    process.exit(1)
}).then(() => console.log("Test 2 Passed"))


//configurable
const configurable = require("../configurable/index");

esbuild.build({
    entryPoints: ['./example/entry.js'],
    outdir: '../example/dist',
    format: "esm",
    minify: true,
    bundle: true,
    splitting: true,
    write: false, //Don't write anywhere
    plugins: [configurable({compileOptions:{dev:true}}),]
}).catch((err) => {
    console.error("Test 3 Failed")
    console.error(err)
    process.exit(1)
}).then(() => console.log("Test 3 Passed"))